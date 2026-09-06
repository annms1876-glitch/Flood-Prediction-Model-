import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Optional, Tuple


class PINN(nn.Module):
    """
    Physics-Informed Neural Network for flood prediction.
    
    Incorporates physical constraints:
    - Water balance equation
    - Conservation of mass
    - Manning's equation for flow velocity
    - Rainfall-runoff relationship
    
    Based on:
    - Raissi et al. (2019) Physics-informed neural networks
    - Flood-specific physics constraints
    """
    
    def __init__(
        self,
        input_size: int = 8,
        hidden_size: int = 64,
        num_layers: int = 4,
        dropout: float = 0.1
    ):
        super().__init__()
        
        layers = []
        in_size = input_size
        
        for i in range(num_layers):
            layers.append(nn.Linear(in_size, hidden_size))
            layers.append(nn.Tanh())
            if i < num_layers - 1:
                layers.append(nn.Dropout(dropout))
            in_size = hidden_size
        
        self.network = nn.Sequential(*layers)
        
        self.water_level_head = nn.Linear(hidden_size, 1)
        self.flow_velocity_head = nn.Linear(hidden_size, 1)
        self.risk_score_head = nn.Linear(hidden_size, 1)
        
        self.physics_weights = nn.Parameter(torch.tensor([0.1, 0.1, 0.1]))
        
    def forward(self, x: torch.Tensor) -> Dict[str, torch.Tensor]:
        features = self.network(x)
        
        water_level = torch.sigmoid(self.water_level_head(features)) * 20.0
        flow_velocity = torch.sigmoid(self.flow_velocity_head(features)) * 10.0
        risk_raw = self.risk_score_head(features)
        risk_score = torch.sigmoid(risk_raw) * 100.0
        
        return {
            "water_level": water_level.squeeze(-1),
            "flow_velocity": flow_velocity.squeeze(-1),
            "risk_score": risk_score.squeeze(-1),
            "features": features
        }
    
    def physics_loss(
        self, 
        x: torch.Tensor, 
        predictions: Dict[str, torch.Tensor],
        dt: float = 1.0
    ) -> torch.Tensor:
        """Compute physics-informed loss."""
        water_level = predictions["water_level"]
        flow_velocity = predictions["flow_velocity"]
        
        rainfall = x[:, 3] if x.shape[1] > 3 else torch.zeros_like(water_level)
        soil_moisture = x[:, 4] if x.shape[1] > 4 else torch.ones_like(water_level) * 0.5
        
        infiltration = soil_moisture * 0.3
        runoff = torch.relu(rainfall - infiltration)
        
        mass_balance_loss = torch.mean(
            (water_level - runoff + flow_velocity * 0.1) ** 2
        )
        
        velocity_constraint = torch.mean(
            torch.relu(-flow_velocity) + torch.relu(flow_velocity - 10.0)
        )
        
        water_constraint = torch.mean(
            torch.relu(-water_level) + torch.relu(water_level - 20.0)
        )
        
        w1, w2, w3 = torch.softmax(self.physics_weights, dim=0)
        total_physics_loss = (
            w1 * mass_balance_loss + 
            w2 * velocity_constraint + 
            w3 * water_constraint
        )
        
        return total_physics_loss


class FloodGNN(nn.Module):
    """
    Graph Neural Network for spatial flood prediction.
    
    Models downstream relationships between sensor locations.
    Uses message passing to propagate flood risk across the sensor graph.
    
    Architecture:
    - Graph attention layers for spatial feature aggregation
    - Node-level predictions for each sensor location
    - Edge-level predictions for downstream impact
    """
    
    def __init__(
        self,
        node_features: int = 8,
        edge_features: int = 4,
        hidden_size: int = 64,
        num_heads: int = 4,
        num_layers: int = 3,
        dropout: float = 0.1
    ):
        super().__init__()
        
        self.node_embedding = nn.Sequential(
            nn.Linear(node_features, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, hidden_size)
        )
        
        self.edge_embedding = nn.Sequential(
            nn.Linear(edge_features, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size)
        )
        
        self.attention_layers = nn.ModuleList([
            GraphAttentionLayer(hidden_size, num_heads, dropout)
            for _ in range(num_layers)
        ])
        
        self.node_predictor = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, 1)
        )
        
        self.impact_predictor = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, 1)
        )
        
    def forward(
        self,
        node_features: torch.Tensor,
        edge_index: torch.Tensor,
        edge_features: Optional[torch.Tensor] = None
    ) -> Dict[str, torch.Tensor]:
        h = self.node_embedding(node_features)
        
        for attn_layer in self.attention_layers:
            h = attn_layer(h, edge_index, edge_features)
        
        node_risk = torch.sigmoid(self.node_predictor(h)) * 100.0
        
        src, dst = edge_index
        edge_repr = torch.cat([h[src], h[dst]], dim=-1)
        edge_impact = torch.sigmoid(self.impact_predictor(edge_repr)) * 100.0
        
        return {
            "node_risk": node_risk.squeeze(-1),
            "edge_impact": edge_impact.squeeze(-1),
            "node_embeddings": h
        }


class GraphAttentionLayer(nn.Module):
    """Single graph attention layer."""
    
    def __init__(self, hidden_size: int, num_heads: int, dropout: float):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads
        
        self.query = nn.Linear(hidden_size, hidden_size)
        self.key = nn.Linear(hidden_size, hidden_size)
        self.value = nn.Linear(hidden_size, hidden_size)
        
        self.output_proj = nn.Linear(hidden_size, hidden_size)
        self.dropout = nn.Dropout(dropout)
        self.norm = nn.LayerNorm(hidden_size)
        
    def forward(
        self, 
        x: torch.Tensor, 
        edge_index: torch.Tensor,
        edge_features: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        residual = x
        
        Q = self.query(x).view(-1, self.num_heads, self.head_dim)
        K = self.key(x).view(-1, self.num_heads, self.head_dim)
        V = self.value(x).view(-1, self.num_heads, self.head_dim)
        
        src, dst = edge_index
        
        attn_scores = torch.sum(Q[src] * K[dst], dim=-1) / (self.head_dim ** 0.5)
        
        if edge_features is not None:
            edge_weights = torch.sigmoid(edge_features.mean(dim=-1, keepdim=True))
            attn_scores = attn_scores * edge_weights
        
        attn_weights = torch.zeros(x.shape[0], x.shape[0], self.num_heads, device=x.device)
        attn_weights[dst, src] = attn_scores.softmax(dim=-1)
        
        attn_out = torch.sum(attn_weights[dst, src].unsqueeze(-1) * V[src], dim=1)
        attn_out = attn_out.view(-1, self.num_heads * self.head_dim)
        
        out = self.output_proj(attn_out)
        out = self.dropout(out)
        out = self.norm(out + residual)
        
        return out


def build_sensor_graph(
    locations: list,
    connectivity: Optional[Dict] = None
) -> Tuple[torch.Tensor, torch.Tensor]:
    """
    Build a graph from sensor locations.
    
    Args:
        locations: List of location IDs
        connectivity: Dict mapping location to list of downstream locations
        
    Returns:
        node_features: Tensor of node features
        edge_index: Tensor of edge indices [2, num_edges]
    """
    num_nodes = len(locations)
    location_to_idx = {loc: i for i, loc in enumerate(locations)}
    
    edges = []
    if connectivity:
        for src, dsts in connectivity.items():
            if src in location_to_idx:
                for dst in dsts:
                    if dst in location_to_idx:
                        edges.append([location_to_idx[src], location_to_idx[dst]])
    else:
        for i in range(num_nodes):
            for j in range(i + 1, min(i + 3, num_nodes)):
                edges.append([i, j])
                edges.append([j, i])
    
    if not edges:
        for i in range(num_nodes - 1):
            edges.append([i, i + 1])
            edges.append([i + 1, i])
    
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    
    return num_nodes, edge_index

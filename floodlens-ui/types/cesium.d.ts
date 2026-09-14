declare module "cesium" {
  export const Ion: {
    defaultAccessToken: string | undefined;
  };
  export class Viewer {
    constructor(canvas: HTMLCanvasElement | string, options?: any);
    destroy(): void;
    entities: {
      add(entity: any): any;
      remove(entity: any): void;
      removeAll(): void;
    };
    scene: any;
    camera: any;
    screenSpaceEventHandler: any;
    flyTo(options: any): Promise<void>;
  }
  export class Cartesian3 {
    constructor(x: number, y: number, z: number);
    static fromDegrees(lng: number, lat: number, height?: number): Cartesian3;
    static distance(a: Cartesian3, b: Cartesian3): number;
  }
  export class Ellipsoid {
    static WGS84: any;
    static scaleToGeodeticSurface(cartesian: Cartesian3): Cartesian3;
  }
  export class Color {
    static fromByteArray(arr: number[]): Color;
    static WHITE: Color;
    static BLACK: Color;
    static GREEN: Color;
    static RED: Color;
    static YELLOW: Color;
    static CYAN: Color;
    static BLUE: Color;
  }
  export class PolylineGlowMaterialProperty {
    constructor(options: { color: Color });
  }
  export class ScreenSpaceEventHandler {
    constructor(canvas: HTMLCanvasElement);
    setInputAction(action: any, type: any): void;
    destroy(): void;
  }
  export enum ScreenSpaceEventType {
    LEFT_CLICK = 0,
    MOUSE_MOVE = 1,
    RIGHT_CLICK = 2,
  }
  export class MATH {
    static toRadians(degrees: number): number;
  }
  export class Math {
    static toRadians(degrees: number): number;
  }
  export function createWorldTerrain(): any;
  export class VerticalOrigin {
    static BOTTOM: number;
  }
  export class Cartographic {
    constructor(longitude: number, latitude: number, height: number);
  }
}

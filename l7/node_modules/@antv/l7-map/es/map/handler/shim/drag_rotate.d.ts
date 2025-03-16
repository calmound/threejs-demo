import type { MousePitchHandler, MouseRotateHandler } from '../mouse';
/**
 * Options object for `DragRotateHandler`.
 */
export type DragRotateHandlerOptions = {
    /**
     * Control the map pitch in addition to the bearing
     * @defaultValue true
     */
    pitchWithRotate: boolean;
};
/**
 * The `DragRotateHandler` allows the user to rotate the map by clicking and
 * dragging the cursor while holding the right mouse button or `ctrl` key.
 *
 * @group Handlers
 */
export declare class DragRotateHandler {
    _mouseRotate: MouseRotateHandler;
    _mousePitch: MousePitchHandler;
    _pitchWithRotate: boolean;
    /** @internal */
    constructor(options: DragRotateHandlerOptions, mouseRotate: MouseRotateHandler, mousePitch: MousePitchHandler);
    /**
     * Enables the "drag to rotate" interaction.
     *
     * @example
     * ```ts
     * map.dragRotate.enable();
     * ```
     */
    enable(): void;
    /**
     * Disables the "drag to rotate" interaction.
     *
     * @example
     * ```ts
     * map.dragRotate.disable();
     * ```
     */
    disable(): void;
    /**
     * Returns a Boolean indicating whether the "drag to rotate" interaction is enabled.
     *
     * @returns `true` if the "drag to rotate" interaction is enabled.
     */
    isEnabled(): boolean;
    /**
     * Returns a Boolean indicating whether the "drag to rotate" interaction is active, i.e. currently being used.
     *
     * @returns `true` if the "drag to rotate" interaction is active.
     */
    isActive(): boolean;
}

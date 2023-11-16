<script lang="ts">
    import { onMount } from "svelte";
    import { T, useFrame } from "@threlte/core";
    import { OrbitControls } from "@threlte/extras";
    import Link from "./Link.svelte";
    import Disc from "./Disc.svelte";
    import { setPosition, rotation, radius, diskHeight, speed, control, movement, circleIntersection } from "./store";
    import type { ChangedType } from "./store";
    import { number } from "astro/zod";
    let x2 = $radius;
    let z2 = 0;
    let x3 = $radius * 2;
    let z3 = 0;
    const setPos = () => {
        setPosition(1, { x: 0, z: 0 });
        setPosition(2, { x: x2, z: z2 });
        setPosition(3, { x: x3, z: z3 });
    };
    onMount(setPos);
    radius.subscribe(setPos);
    useFrame(() => {
        $rotation = ($rotation + $speed) % (Math.PI * 2);
    });
    let orbit;

    function onKeyDown(e: KeyboardEvent) {
        const changed: ChangedType = {
            ArrowUp: () => [0, -$movement],
            ArrowDown: () => [0, $movement],
            ArrowLeft: () => [-$movement, 0],
            ArrowRight: () => [$movement, 0],
        };
        if (!changed[e.key]) {
            return;
        }
        const [x, y] = changed[e.key]();
        const [newPos, newPos2] = circleIntersection(0, 0, $radius, x3 + x, z3 + y, $radius);
        if (newPos || newPos2) {
            if (newPos) {
                x2 = newPos.x;
                z2 = newPos.y;
            } else if (newPos2) {
                x2 = newPos2.x;
                z2 = newPos2.y;
            }
            x3 += x;
            z3 += y;
            setPosition(2, { x: x2, z: z2 });
            setPosition(3, { x: x3, z: z3 });
        }
    }
</script>

<svelte:window on:keydown={onKeyDown} />

<T.AmbientLight />
<T.PerspectiveCamera
    makeDefault
    position={[0, 10, 10]}
    on:create={({ ref }) => {
        ref.lookAt(0, 0, 0);
    }}
>
    <OrbitControls bind:this={orbit} enableZoom={$control} />
</T.PerspectiveCamera>
<Disc />
<T.Group position.y={$diskHeight / 2 + $diskHeight / 4}>
    <Link num={1} />
</T.Group>
<T.Group position.y={($diskHeight / 2) * 3}>
    <T.Group position.y={$diskHeight / 2 + $diskHeight / 4}>
        <Link num={2} />
    </T.Group>
    <T.Group position.x={x2} position.z={z2}>
        <Disc />
    </T.Group>
</T.Group>
<T.Group position.y={($diskHeight / 2) * 6} position.x={x3} position.z={z3}>
    <Disc />
</T.Group>

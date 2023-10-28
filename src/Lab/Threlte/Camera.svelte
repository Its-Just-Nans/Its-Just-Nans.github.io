<script>
    import { T, extend, useThrelte, useFrame } from "@threlte/core";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import { Vector3 } from "three";
    import { interactivity } from "@threlte/extras";
    import { rigthClicked } from "./store";

    extend({
        OrbitControls,
    });

    const { pointer } = interactivity();
    const { invalidate } = useThrelte();
    const { camera } = useThrelte();
    const vec = new Vector3();
    let enableZoom = true;
    let el = enableZoom ? document.querySelector(".threlte") : document.createElement("div");
    let r;
    useFrame(() => {
        if (!enableZoom && r) {
            r.position.lerp(vec.set(pointer.current.x, pointer.current.y, camera.current.position.z), 0.05);
            camera.current.lookAt(0, 0, 0);
        }
    });
    rigthClicked.subscribe((v) => {
        enableZoom = v;
        el = v ? document.querySelector(".threlte") : document.createElement("div");
    });
</script>

<T.PerspectiveCamera
    position={[0, 0, 10]}
    on:create={({ ref }) => {
        ref.lookAt(0, 0, 0);
        r = ref;
    }}
    makeDefault
    let:ref
>
    <T.OrbitControls on:change={invalidate} {enableZoom} args={[ref, el]} />
</T.PerspectiveCamera>

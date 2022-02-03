var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.45.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Header.svelte generated by Svelte v3.45.0 */

    const file$6 = "src/Header.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i].name;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i].name;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (46:16) {#each nav as { name }
    function create_each_block_1(ctx) {
    	let h2;
    	let t0_value = /*name*/ ctx[11] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[9](/*index*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(h2, "class", "menuLinks svelte-8blf2v");
    			add_location(h2, file$6, 46, 20, 1322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);

    			if (!mounted) {
    				dispose = listen_dev(h2, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*nav*/ 2 && t0_value !== (t0_value = /*name*/ ctx[11] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(46:16) {#each nav as { name }",
    		ctx
    	});

    	return block;
    }

    // (61:8) {#each nav as { name }
    function create_each_block$4(ctx) {
    	let h2;
    	let t0_value = /*name*/ ctx[11] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[10](/*index*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(h2, "class", "menuLinks svelte-8blf2v");
    			add_location(h2, file$6, 61, 12, 1759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);

    			if (!mounted) {
    				dispose = listen_dev(h2, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*nav*/ 2 && t0_value !== (t0_value = /*name*/ ctx[11] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(61:8) {#each nav as { name }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let header;
    	let div2;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div3;
    	let span1;
    	let h2;
    	let t4;
    	let span0;
    	let t5;
    	let div4;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*nav*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*nav*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div3 = element("div");
    			span1 = element("span");
    			h2 = element("h2");
    			h2.textContent = "Menu";
    			t4 = space();
    			span0 = element("span");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "frontTitle cursorPointer svelte-8blf2v");
    			add_location(h1, file$6, 14, 12, 324);
    			attr_dev(div0, "class", "titleContainer svelte-8blf2v");
    			add_location(div0, file$6, 13, 8, 283);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "cursorPointer svelte-8blf2v");
    			if (!src_url_equal(img.src, img_src_value = "https://raw.githubusercontent.com/Its-Just-Nans/Its-Just-Nans/main/n4n5.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$6, 24, 12, 618);
    			attr_dev(div1, "class", "imgContainer svelte-8blf2v");
    			attr_dev(div1, "data-tooltip", "Its-Just-Nans / n4n5");
    			add_location(div1, file$6, 23, 8, 543);
    			attr_dev(div2, "class", "title svelte-8blf2v");
    			add_location(div2, file$6, 12, 4, 255);
    			attr_dev(h2, "class", "smallMenuTitle svelte-8blf2v");
    			add_location(h2, file$6, 36, 12, 1012);
    			attr_dev(span0, "class", "underSmallMenu svelte-8blf2v");
    			add_location(span0, file$6, 44, 12, 1225);
    			attr_dev(span1, "class", "smallMenu svelte-8blf2v");
    			toggle_class(span1, "smallMenuOpen", /*menuIsOpen*/ ctx[4]);
    			add_location(span1, file$6, 35, 8, 942);
    			attr_dev(div3, "class", "space svelte-8blf2v");
    			add_location(div3, file$6, 34, 4, 914);
    			attr_dev(div4, "class", "navLinks svelte-8blf2v");
    			add_location(div4, file$6, 59, 4, 1685);
    			set_style(header, "--globalColor", /*globalColor*/ ctx[3]);
    			attr_dev(header, "class", "svelte-8blf2v");
    			add_location(header, file$6, 11, 0, 205);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(header, t2);
    			append_dev(header, div3);
    			append_dev(div3, span1);
    			append_dev(span1, h2);
    			append_dev(span1, t4);
    			append_dev(span1, span0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(span0, null);
    			}

    			append_dev(header, t5);
    			append_dev(header, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(h1, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(img, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(h2, "click", /*click_handler_2*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*actualNav, menuIsOpen, nav*/ 22) {
    				each_value_1 = /*nav*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(span0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*menuIsOpen*/ 16) {
    				toggle_class(span1, "smallMenuOpen", /*menuIsOpen*/ ctx[4]);
    			}

    			if (dirty & /*actualNav, nav*/ 6) {
    				each_value = /*nav*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*globalColor*/ 8) {
    				set_style(header, "--globalColor", /*globalColor*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { title } = $$props;
    	let { nav = [] } = $$props;
    	let { actualNav } = $$props;
    	let { globalColor } = $$props;

    	function returnBase() {
    		actualNav(0);
    	}

    	let menuIsOpen = false;
    	const writable_props = ['title', 'nav', 'actualNav', 'globalColor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		returnBase();
    	};

    	const click_handler_1 = () => {
    		returnBase();
    	};

    	const click_handler_2 = function () {
    		$$invalidate(4, menuIsOpen = !menuIsOpen);
    	};

    	const click_handler_3 = index => {
    		actualNav(index);
    		$$invalidate(4, menuIsOpen = false);
    	};

    	const click_handler_4 = index => {
    		actualNav(index);
    	};

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('nav' in $$props) $$invalidate(1, nav = $$props.nav);
    		if ('actualNav' in $$props) $$invalidate(2, actualNav = $$props.actualNav);
    		if ('globalColor' in $$props) $$invalidate(3, globalColor = $$props.globalColor);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		nav,
    		actualNav,
    		globalColor,
    		returnBase,
    		menuIsOpen
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('nav' in $$props) $$invalidate(1, nav = $$props.nav);
    		if ('actualNav' in $$props) $$invalidate(2, actualNav = $$props.actualNav);
    		if ('globalColor' in $$props) $$invalidate(3, globalColor = $$props.globalColor);
    		if ('menuIsOpen' in $$props) $$invalidate(4, menuIsOpen = $$props.menuIsOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		nav,
    		actualNav,
    		globalColor,
    		menuIsOpen,
    		returnBase,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			title: 0,
    			nav: 1,
    			actualNav: 2,
    			globalColor: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<Header> was created without expected prop 'title'");
    		}

    		if (/*actualNav*/ ctx[2] === undefined && !('actualNav' in props)) {
    			console.warn("<Header> was created without expected prop 'actualNav'");
    		}

    		if (/*globalColor*/ ctx[3] === undefined && !('globalColor' in props)) {
    			console.warn("<Header> was created without expected prop 'globalColor'");
    		}
    	}

    	get title() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nav() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nav(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actualNav() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actualNav(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get globalColor() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set globalColor(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Article.svelte generated by Svelte v3.45.0 */

    const file$5 = "src/Article.svelte";

    // (39:16) {:else}
    function create_else_block(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", svg2);
    			attr_dev(path, "class", "svelte-16wo6iz");
    			add_location(path, file$5, 39, 20, 1134);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(39:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:16) {#if open}
    function create_if_block$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", svg1);
    			attr_dev(path, "class", "svelte-16wo6iz");
    			add_location(path, file$5, 37, 20, 1072);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(37:16) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div5;
    	let div2;
    	let p0;
    	let t0_value = (/*content*/ ctx[0].date1 || "?") + "";
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let t3_value = (/*content*/ ctx[0].date2 || "") + "";
    	let t3;
    	let t4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t5;
    	let p1;
    	let t6_value = (/*content*/ ctx[0].title || "") + "";
    	let t6;
    	let t7;
    	let div1;
    	let svg;
    	let t8;
    	let div4;
    	let div3;
    	let raw_value = (/*content*/ ctx[0].desc || "") + "";
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*open*/ ctx[2]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			div0 = element("div");
    			img = element("img");
    			t5 = space();
    			p1 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			if_block.c();
    			t8 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(br, "class", "svelte-16wo6iz");
    			add_location(br, file$5, 27, 12, 683);
    			attr_dev(p0, "class", "svelte-16wo6iz");
    			add_location(p0, file$5, 25, 8, 632);
    			attr_dev(img, "class", "iconSmall svelte-16wo6iz");
    			if (!src_url_equal(img.src, img_src_value = /*content*/ ctx[0].ico || "")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 31, 12, 786);
    			attr_dev(p1, "class", "title svelte-16wo6iz");
    			add_location(p1, file$5, 32, 12, 855);
    			attr_dev(div0, "class", "titleContainer svelte-16wo6iz");
    			add_location(div0, file$5, 30, 8, 745);
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "viewBox", viewBox);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "class", "svelte-16wo6iz");
    			add_location(svg, file$5, 35, 12, 972);
    			attr_dev(div1, "class", "plusOrMinus iconShowMore svelte-16wo6iz");
    			add_location(div1, file$5, 34, 8, 921);
    			attr_dev(div2, "class", "firstDiv svelte-16wo6iz");
    			add_location(div2, file$5, 19, 4, 525);
    			attr_dev(div3, "class", "historyDetail svelte-16wo6iz");
    			add_location(div3, file$5, 45, 8, 1255);
    			attr_dev(div4, "class", "secondDiv svelte-16wo6iz");
    			add_location(div4, file$5, 44, 4, 1223);
    			attr_dev(div5, "class", "historyLine svelte-16wo6iz");
    			toggle_class(div5, "toRight", /*change*/ ctx[3] && /*index*/ ctx[1] % 2 == 0);
    			toggle_class(div5, "toLeft", /*change*/ ctx[3] && /*index*/ ctx[1] % 2 == 1);
    			toggle_class(div5, "historyLineOpen", /*open*/ ctx[2]);
    			add_location(div5, file$5, 13, 0, 368);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, br);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(p1, t6);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			if_block.m(svg, null);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			div3.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1 && t0_value !== (t0_value = (/*content*/ ctx[0].date1 || "?") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*content*/ 1 && t3_value !== (t3_value = (/*content*/ ctx[0].date2 || "") + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*content*/ 1 && !src_url_equal(img.src, img_src_value = /*content*/ ctx[0].ico || "")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*content*/ 1 && t6_value !== (t6_value = (/*content*/ ctx[0].title || "") + "")) set_data_dev(t6, t6_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(svg, null);
    				}
    			}

    			if (dirty & /*content*/ 1 && raw_value !== (raw_value = (/*content*/ ctx[0].desc || "") + "")) div3.innerHTML = raw_value;
    			if (dirty & /*change, index*/ 10) {
    				toggle_class(div5, "toRight", /*change*/ ctx[3] && /*index*/ ctx[1] % 2 == 0);
    			}

    			if (dirty & /*change, index*/ 10) {
    				toggle_class(div5, "toLeft", /*change*/ ctx[3] && /*index*/ ctx[1] % 2 == 1);
    			}

    			if (dirty & /*open*/ 4) {
    				toggle_class(div5, "historyLineOpen", /*open*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const viewBox = "0 0 24 24";
    const svg1 = "M19 13H5v-2h14v2z";
    const svg2 = "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z";

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Article', slots, []);
    	let { content } = $$props;
    	let { index } = $$props;
    	let { type } = $$props;
    	let open = false;
    	let change = false;
    	const writable_props = ['content', 'index', 'type'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Article> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(2, open = !open);
    	};

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('type' in $$props) $$invalidate(4, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		content,
    		index,
    		type,
    		open,
    		change,
    		viewBox,
    		svg1,
    		svg2
    	});

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('type' in $$props) $$invalidate(4, type = $$props.type);
    		if ('open' in $$props) $$invalidate(2, open = $$props.open);
    		if ('change' in $$props) $$invalidate(3, change = $$props.change);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 16) {
    			$$invalidate(2, open = type.includes("open") ? true : false);
    		}

    		if ($$self.$$.dirty & /*type*/ 16) {
    			$$invalidate(3, change = type.includes("change") ? true : false);
    		}
    	};

    	return [content, index, open, change, type, click_handler];
    }

    class Article extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { content: 0, index: 1, type: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Article",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !('content' in props)) {
    			console.warn("<Article> was created without expected prop 'content'");
    		}

    		if (/*index*/ ctx[1] === undefined && !('index' in props)) {
    			console.warn("<Article> was created without expected prop 'index'");
    		}

    		if (/*type*/ ctx[4] === undefined && !('type' in props)) {
    			console.warn("<Article> was created without expected prop 'type'");
    		}
    	}

    	get content() {
    		throw new Error("<Article>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Article>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Article>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Article>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Article>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Article>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/History.svelte generated by Svelte v3.45.0 */
    const file$4 = "src/History.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (35:4) {#each data as oneData, index}
    function create_each_block$3(ctx) {
    	let article;
    	let current;

    	article = new Article({
    			props: {
    				type: /*type*/ ctx[1],
    				content: /*oneData*/ ctx[5],
    				index: /*index*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(article.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(article, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const article_changes = {};
    			if (dirty & /*type*/ 2) article_changes.type = /*type*/ ctx[1];
    			if (dirty & /*data*/ 1) article_changes.content = /*oneData*/ ctx[5];
    			article.$set(article_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(article.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(article.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(article, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(35:4) {#each data as oneData, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let article;
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let br;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			article = element("article");
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Open/Close";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "change";
    			t3 = space();
    			br = element("br");
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button0, "class", "style-4 svelte-pe112a");
    			add_location(button0, file$4, 16, 8, 385);
    			attr_dev(button1, "class", "style-4 svelte-pe112a");
    			add_location(button1, file$4, 24, 8, 561);
    			set_style(div, "text-align", "center");
    			add_location(div, file$4, 15, 4, 343);
    			add_location(br, file$4, 33, 4, 742);
    			add_location(article, file$4, 14, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(article, t3);
    			append_dev(article, br);
    			append_dev(article, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(article, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*type, data*/ 3) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(article, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('History', slots, []);
    	let { data = [] } = $$props;
    	let type = "";

    	function changeType(newtype) {
    		if (type.includes(newtype)) {
    			$$invalidate(1, type = type.replace(`${newtype}`, ""));
    		} else {
    			$$invalidate(1, type += ` ${newtype}`);
    		}

    		$$invalidate(1, type = type.trim());
    	}

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<History> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		changeType("open");
    	};

    	const click_handler_1 = () => {
    		changeType("change");
    	};

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data, Article, type, changeType });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, type, changeType, click_handler, click_handler_1];
    }

    class History extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "History",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get data() {
    		throw new Error("<History>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<History>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Projects.svelte generated by Svelte v3.45.0 */

    const file$3 = "src/Projects.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (92:12) {#if oneData.fork == false && !noRender.includes(oneData.name)}
    function create_if_block_3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*index*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "block cursorPointer svelte-1fydu6m");
    			if (!src_url_equal(img.src, img_src_value = `https://github-readme-stats.vercel.app/api/pin/?username=its-just-nans&repo=${/*oneData*/ ctx[9].name}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 102, 20, 3504);
    			attr_dev(div, "class", "projectsDiv svelte-1fydu6m");
    			add_location(div, file$3, 92, 16, 3165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 1 && !src_url_equal(img.src, img_src_value = `https://github-readme-stats.vercel.app/api/pin/?username=its-just-nans&repo=${/*oneData*/ ctx[9].name}`)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(92:12) {#if oneData.fork == false && !noRender.includes(oneData.name)}",
    		ctx
    	});

    	return block;
    }

    // (110:12) {#if oneData.url && oneData.url.startsWith("https://api.github.com/gists")}
    function create_if_block_2(ctx) {
    	let div;
    	let svg1;
    	let rect;
    	let g2;
    	let g0;
    	let svg0;
    	let path;
    	let g1;
    	let text_1;
    	let t0;
    	let t1_value = /*oneData*/ ctx[9].description.substring(0, 24).trim().concat(/*oneData*/ ctx[9].description.length > 24 ? "..." : "") + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[4](/*index*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg1 = svg_element("svg");
    			rect = svg_element("rect");
    			g2 = svg_element("g");
    			g0 = svg_element("g");
    			svg0 = svg_element("svg");
    			path = svg_element("path");
    			g1 = svg_element("g");
    			text_1 = svg_element("text");
    			t0 = text("Gist - ");
    			t1 = text(t1_value);
    			attr_dev(rect, "x", "0.5");
    			attr_dev(rect, "y", "0.5");
    			attr_dev(rect, "rx", "4.5");
    			attr_dev(rect, "height", "99%");
    			attr_dev(rect, "stroke", "#e4e2e2");
    			attr_dev(rect, "width", "399");
    			attr_dev(rect, "fill", "#fffefe");
    			attr_dev(rect, "stroke-opacity", "1");
    			add_location(rect, file$3, 128, 24, 4541);
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M1.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25H1.75zM0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0114.25 16H1.75A1.75 1.75 0 010 14.25V1.75zm9.22 3.72a.75.75 0 000 1.06L10.69 8 9.22 9.47a.75.75 0 101.06 1.06l2-2a.75.75 0 000-1.06l-2-2a.75.75 0 00-1.06 0zM6.78 6.53a.75.75 0 00-1.06-1.06l-2 2a.75.75 0 000 1.06l2 2a.75.75 0 101.06-1.06L5.31 8l1.47-1.47z");
    			add_location(path, file$3, 149, 36, 5460);
    			attr_dev(svg0, "class", "icon");
    			attr_dev(svg0, "x", "0");
    			attr_dev(svg0, "y", "-13");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			add_location(svg0, file$3, 140, 32, 5049);
    			attr_dev(g0, "transform", "translate(0, 0)");
    			add_location(g0, file$3, 139, 28, 4985);
    			attr_dev(text_1, "x", "0");
    			attr_dev(text_1, "y", "0");
    			add_location(text_1, file$3, 156, 32, 6213);
    			attr_dev(g1, "transform", "translate(25, 0)");
    			add_location(g1, file$3, 155, 28, 6148);
    			attr_dev(g2, "transform", "translate(25, 35)");
    			add_location(g2, file$3, 138, 24, 4923);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "block cursorPointer svelte-1fydu6m");
    			attr_dev(svg1, "width", "400");
    			attr_dev(svg1, "height", "120");
    			attr_dev(svg1, "viewBox", "0 0 400 120");
    			attr_dev(svg1, "fill", "black");
    			add_location(svg1, file$3, 120, 20, 4223);
    			attr_dev(div, "class", "projectsDiv svelte-1fydu6m");
    			add_location(div, file$3, 110, 16, 3884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg1);
    			append_dev(svg1, rect);
    			append_dev(svg1, g2);
    			append_dev(g2, g0);
    			append_dev(g0, svg0);
    			append_dev(svg0, path);
    			append_dev(g2, g1);
    			append_dev(g1, text_1);
    			append_dev(text_1, t0);
    			append_dev(text_1, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*oneData*/ ctx[9].description.substring(0, 24).trim().concat(/*oneData*/ ctx[9].description.length > 24 ? "..." : "") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(110:12) {#if oneData.url && oneData.url.startsWith(\\\"https://api.github.com/gists\\\")}",
    		ctx
    	});

    	return block;
    }

    // (172:12) {#if index == clicked}
    function create_if_block(ctx) {
    	let br0;
    	let t0;
    	let div;
    	let svg1;
    	let rect;
    	let g1;
    	let g0;
    	let text0;

    	let t1_value = (/*oneData*/ ctx[9].url.startsWith("https://api.github.com/gists")
    	? /*oneData*/ ctx[9].description.substring(0, 24).trim().concat(/*oneData*/ ctx[9].description.length > 24 ? "..." : "")
    	: /*oneData*/ ctx[9].name) + "";

    	let t1;
    	let a;
    	let g4;
    	let g2;
    	let svg0;
    	let path;
    	let g3;
    	let text1;

    	let t2_value = (/*oneData*/ ctx[9].url.startsWith("https://api.github.com/gists")
    	? "View the Gist on GitHub"
    	: "View the repository on GitHub") + "";

    	let t2;
    	let a_href_value;
    	let t3;
    	let br1;
    	let if_block = /*oneData*/ ctx[9].homepage && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			div = element("div");
    			svg1 = svg_element("svg");
    			rect = svg_element("rect");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			text0 = svg_element("text");
    			t1 = text(t1_value);
    			a = svg_element("a");
    			g4 = svg_element("g");
    			g2 = svg_element("g");
    			svg0 = svg_element("svg");
    			path = svg_element("path");
    			g3 = svg_element("g");
    			text1 = svg_element("text");
    			t2 = text(t2_value);
    			if (if_block) if_block.c();
    			t3 = space();
    			br1 = element("br");
    			add_location(br0, file$3, 172, 16, 6900);
    			attr_dev(rect, "x", "0.5");
    			attr_dev(rect, "y", "0.5");
    			attr_dev(rect, "rx", "4.5");
    			attr_dev(rect, "height", "99%");
    			attr_dev(rect, "stroke", "#e4e2e2");
    			attr_dev(rect, "width", "399");
    			attr_dev(rect, "fill", "#fffefe");
    			attr_dev(rect, "stroke-opacity", "1");
    			attr_dev(rect, "class", "svelte-1fydu6m");
    			add_location(rect, file$3, 181, 24, 7247);
    			attr_dev(text0, "x", "0");
    			attr_dev(text0, "y", "0");
    			attr_dev(text0, "class", "svelte-1fydu6m");
    			add_location(text0, file$3, 193, 32, 7756);
    			attr_dev(g0, "transform", "translate(25, 0)");
    			add_location(g0, file$3, 192, 28, 7691);
    			attr_dev(g1, "transform", "translate(25, 35)");
    			add_location(g1, file$3, 191, 24, 7629);
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M18,1.4C9,1.4,1.7,8.7,1.7,17.7c0,7.2,4.7,13.3,11.1,15.5\n                                        c0.8,0.1,1.1-0.4,1.1-0.8c0-0.4,0-1.4,0-2.8c-4.5,1-5.5-2.2-5.5-2.2c-0.7-1.9-1.8-2.4-1.8-2.4c-1.5-1,0.1-1,0.1-1\n                                        c1.6,0.1,2.5,1.7,2.5,1.7c1.5,2.5,3.8,1.8,4.7,1.4c0.1-1.1,0.6-1.8,1-2.2c-3.6-0.4-7.4-1.8-7.4-8.1c0-1.8,0.6-3.2,1.7-4.4\n                                        c-0.2-0.4-0.7-2.1,0.2-4.3c0,0,1.4-0.4,4.5,1.7c1.3-0.4,2.7-0.5,4.1-0.5c1.4,0,2.8,0.2,4.1,0.5c3.1-2.1,4.5-1.7,4.5-1.7\n                                        c0.9,2.2,0.3,3.9,0.2,4.3c1,1.1,1.7,2.6,1.7,4.4c0,6.3-3.8,7.6-7.4,8c0.6,0.5,1.1,1.5,1.1,3c0,2.2,0,3.9,0,4.5\n                                        c0,0.4,0.3,0.9,1.1,0.8c6.5-2.2,11.1-8.3,11.1-15.5C34.3,8.7,27,1.4,18,1.4z");
    			add_location(path, file$3, 226, 40, 9451);
    			attr_dev(svg0, "class", "icon");
    			attr_dev(svg0, "x", "0");
    			attr_dev(svg0, "y", "-13");
    			attr_dev(svg0, "viewBox", "0 0 38 38");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "width", "16");
    			attr_dev(svg0, "height", "16");
    			add_location(svg0, file$3, 217, 36, 9004);
    			attr_dev(g2, "transform", "translate(0, 0)");
    			add_location(g2, file$3, 216, 32, 8936);
    			attr_dev(text1, "x", "0");
    			attr_dev(text1, "y", "0");
    			attr_dev(text1, "class", "svelte-1fydu6m");
    			add_location(text1, file$3, 238, 36, 10574);
    			attr_dev(g3, "transform", "translate(25, 0)");
    			add_location(g3, file$3, 237, 32, 10505);
    			attr_dev(g4, "transform", "translate(25, 75)");
    			add_location(g4, file$3, 215, 28, 8870);
    			attr_dev(a, "href", a_href_value = /*oneData*/ ctx[9].html_url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "cursorPointer svelte-1fydu6m");
    			add_location(a, file$3, 210, 24, 8667);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "400");
    			attr_dev(svg1, "height", "120");
    			attr_dev(svg1, "viewBox", "0 0 400 120");
    			attr_dev(svg1, "fill", "black");
    			attr_dev(svg1, "class", "svelte-1fydu6m");
    			add_location(svg1, file$3, 174, 20, 6981);
    			attr_dev(div, "class", "projectsDiv projectHelp svelte-1fydu6m");
    			add_location(div, file$3, 173, 16, 6923);
    			add_location(br1, file$3, 280, 16, 13013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg1);
    			append_dev(svg1, rect);
    			append_dev(svg1, g1);
    			append_dev(g1, g0);
    			append_dev(g0, text0);
    			append_dev(text0, t1);
    			append_dev(svg1, a);
    			append_dev(a, g4);
    			append_dev(g4, g2);
    			append_dev(g2, svg0);
    			append_dev(svg0, path);
    			append_dev(g4, g3);
    			append_dev(g3, text1);
    			append_dev(text1, t2);
    			if (if_block) if_block.m(svg1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = (/*oneData*/ ctx[9].url.startsWith("https://api.github.com/gists")
    			? /*oneData*/ ctx[9].description.substring(0, 24).trim().concat(/*oneData*/ ctx[9].description.length > 24 ? "..." : "")
    			: /*oneData*/ ctx[9].name) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = (/*oneData*/ ctx[9].url.startsWith("https://api.github.com/gists")
    			? "View the Gist on GitHub"
    			: "View the repository on GitHub") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*data*/ 1 && a_href_value !== (a_href_value = /*oneData*/ ctx[9].html_url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*oneData*/ ctx[9].homepage) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(svg1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(172:12) {#if index == clicked}",
    		ctx
    	});

    	return block;
    }

    // (249:24) {#if oneData.homepage}
    function create_if_block_1(ctx) {
    	let a;
    	let g2;
    	let g0;
    	let svg;
    	let path;
    	let g1;
    	let text_1;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = svg_element("a");
    			g2 = svg_element("g");
    			g0 = svg_element("g");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			g1 = svg_element("g");
    			text_1 = svg_element("text");
    			t = text("View the project");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z");
    			add_location(path, file$3, 265, 44, 11993);
    			attr_dev(svg, "class", "icon");
    			attr_dev(svg, "x", "0");
    			attr_dev(svg, "y", "-13");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			add_location(svg, file$3, 256, 40, 11510);
    			attr_dev(g0, "transform", "translate(0, 0)");
    			add_location(g0, file$3, 255, 36, 11438);
    			attr_dev(text_1, "x", "0");
    			attr_dev(text_1, "y", "0");
    			attr_dev(text_1, "class", "svelte-1fydu6m");
    			add_location(text_1, file$3, 272, 40, 12723);
    			attr_dev(g1, "transform", "translate(25, 0)");
    			add_location(g1, file$3, 271, 36, 12650);
    			attr_dev(g2, "transform", "translate(25, 100)");
    			add_location(g2, file$3, 254, 32, 11367);
    			attr_dev(a, "href", a_href_value = /*oneData*/ ctx[9].homepage);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "cursorPointer svelte-1fydu6m");
    			add_location(a, file$3, 249, 28, 11144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, g2);
    			append_dev(g2, g0);
    			append_dev(g0, svg);
    			append_dev(svg, path);
    			append_dev(g2, g1);
    			append_dev(g1, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && a_href_value !== (a_href_value = /*oneData*/ ctx[9].homepage)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(249:24) {#if oneData.homepage}",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#each data as oneData, index}
    function create_each_block$2(ctx) {
    	let show_if_1 = /*oneData*/ ctx[9].fork == false && !/*noRender*/ ctx[2].includes(/*oneData*/ ctx[9].name);
    	let t0;
    	let show_if = /*oneData*/ ctx[9].url && /*oneData*/ ctx[9].url.startsWith("https://api.github.com/gists");
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = show_if_1 && create_if_block_3(ctx);
    	let if_block1 = show_if && create_if_block_2(ctx);
    	let if_block2 = /*index*/ ctx[11] == /*clicked*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) show_if_1 = /*oneData*/ ctx[9].fork == false && !/*noRender*/ ctx[2].includes(/*oneData*/ ctx[9].name);

    			if (show_if_1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*data*/ 1) show_if = /*oneData*/ ctx[9].url && /*oneData*/ ctx[9].url.startsWith("https://api.github.com/gists");

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*index*/ ctx[11] == /*clicked*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(91:8) {#each data as oneData, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let article;
    	let div;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "projects svelte-1fydu6m");
    			add_location(div, file$3, 89, 4, 3011);
    			attr_dev(article, "class", "svelte-1fydu6m");
    			add_location(article, file$3, 88, 0, 2997);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data, clicked, noRender*/ 7) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const name = "projects.json";

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);
    	let { data = [] } = $$props;
    	const noRender = ["Its-Just-Nans"];

    	const getDataFromAPIs = async () => {
    		fetch("https://api.github.com/users/Its-Just-Nans/repos").then(newResponse => {
    			newResponse.json().then(newJson => {
    				if (Array.isArray(newJson)) {
    					if (newJson.length != data.length) {
    						addToData(newJson);

    						smollPopUp(
    							{
    								title: "Message to admin",
    								msg: "curl -o data/projects.json https://api.github.com/users/Its-Just-Nans/repos",
    								button: "Copier"
    							},
    							{ type: "ko" },
    							function Copier(rep) {
    								copy(rep.msg);
    							}
    						);
    					}
    				}

    				getGists();
    			});
    		}).catch(() => {
    			getGists();
    		});
    	};

    	const start = () => {
    		if (window && window.sessionStorage) {
    			const localString = window.sessionStorage.getItem("projects") || {};
    			let local;

    			try {
    				local = JSON.parse(localString) || {};
    			} catch(e) {
    				local = {};
    			}

    			if (local !== null) {
    				if (typeof local.dataLoaded !== "undefined" || local.dataLoaded === true) {
    					const areGistPresent = data.find(element => element.url.startsWith("https://api.github.com/gists/"));

    					if (areGistPresent) {
    						return;
    					}
    				}
    			}

    			getDataFromAPIs();
    			window.sessionStorage.setItem("projects", JSON.stringify({ ...local, dataLoaded: true }));
    		}
    	};

    	start();

    	function getGists() {
    		fetch("https://api.github.com/users/its-just-nans/gists").then(newResponse => {
    			newResponse.json().then(newJson => {
    				if (Array.isArray(newJson)) {
    					addToData(newJson);
    				}
    			});
    		});
    	}

    	const addToData = array => {
    		for (const oneElement of array) {
    			const isInArray = data.findIndex(element => {
    				return element.url === oneElement.url;
    			});

    			if (isInArray == -1) {
    				$$invalidate(0, data = [...data, oneElement]);
    			}
    		}
    	};

    	let clicked = -20;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => {
    		if (clicked == index) {
    			$$invalidate(1, clicked = -20);
    		} else {
    			$$invalidate(1, clicked = index);
    		}
    	};

    	const click_handler_1 = index => {
    		if (clicked == index) {
    			$$invalidate(1, clicked = -20);
    		} else {
    			$$invalidate(1, clicked = index);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		data,
    		name,
    		noRender,
    		getDataFromAPIs,
    		start,
    		getGists,
    		addToData,
    		clicked
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('clicked' in $$props) $$invalidate(1, clicked = $$props.clicked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, clicked, noRender, click_handler, click_handler_1];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get data() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/About.svelte generated by Svelte v3.45.0 */

    const file$2 = "src/About.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (36:12) {#each data as oneLang, index}
    function create_each_block$1(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let a_href_value;
    	let a_data_tooltip_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "iconLang");
    			attr_dev(img, "alt", img_alt_value = /*oneLang*/ ctx[1].name);
    			if (!src_url_equal(img.src, img_src_value = /*oneLang*/ ctx[1].ico)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 38, 24, 1182);
    			attr_dev(a, "href", a_href_value = /*oneLang*/ ctx[1].link);
    			attr_dev(a, "data-tooltip", a_data_tooltip_value = /*oneLang*/ ctx[1].name);
    			add_location(a, file$2, 37, 20, 1106);
    			attr_dev(div, "class", "lang svelte-17kqt4i");
    			add_location(div, file$2, 36, 16, 1067);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && img_alt_value !== (img_alt_value = /*oneLang*/ ctx[1].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*data*/ 1 && !src_url_equal(img.src, img_src_value = /*oneLang*/ ctx[1].ico)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 1 && a_href_value !== (a_href_value = /*oneLang*/ ctx[1].link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*data*/ 1 && a_data_tooltip_value !== (a_data_tooltip_value = /*oneLang*/ ctx[1].name)) {
    				attr_dev(a, "data-tooltip", a_data_tooltip_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:12) {#each data as oneLang, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let article;
    	let div0;
    	let h20;
    	let t1;
    	let h30;
    	let t3;
    	let p0;
    	let t5;
    	let ul;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let h40;
    	let t11;
    	let h31;
    	let t13;
    	let p1;
    	let t15;
    	let div1;
    	let h21;
    	let t17;
    	let a0;
    	let h41;
    	let t19;
    	let a1;
    	let h42;
    	let t21;
    	let div6;
    	let h22;
    	let t23;
    	let div2;
    	let t24;
    	let br;
    	let t25;
    	let div5;
    	let h32;
    	let t27;
    	let div3;
    	let img0;
    	let img0_src_value;
    	let t28;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t29;
    	let div8;
    	let h23;
    	let t31;
    	let div7;
    	let p2;
    	let t33;
    	let a2;
    	let p3;
    	let t35;
    	let img2;
    	let img2_src_value;
    	let t36;
    	let p4;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Who am I ?";
    			t1 = space();
    			h30 = element("h3");
    			h30.textContent = "- Two name";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "I use two pseudonym :";
    			t5 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Its-Just-Nans";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "n4n5";
    			t9 = space();
    			h40 = element("h4");
    			h40.textContent = "this.style.color = 'Its-Just-Nans' == 'n4n5' ? 'green' : 'red';";
    			t11 = space();
    			h31 = element("h3");
    			h31.textContent = "- Bio";
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "Bio soon...";
    			t15 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Quick links";
    			t17 = space();
    			a0 = element("a");
    			h41 = element("h4");
    			h41.textContent = "Link to golb";
    			t19 = space();
    			a1 = element("a");
    			h42 = element("h4");
    			h42.textContent = "Link to R&T website";
    			t21 = space();
    			div6 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Languages";
    			t23 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t24 = space();
    			br = element("br");
    			t25 = space();
    			div5 = element("div");
    			h32 = element("h3");
    			h32.textContent = "GitHub stats";
    			t27 = space();
    			div3 = element("div");
    			img0 = element("img");
    			t28 = space();
    			div4 = element("div");
    			img1 = element("img");
    			t29 = space();
    			div8 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Thanks for watching";
    			t31 = space();
    			div7 = element("div");
    			p2 = element("p");
    			p2.textContent = "Made with";
    			t33 = space();
    			a2 = element("a");
    			p3 = element("p");
    			p3.textContent = "Svelte";
    			t35 = space();
    			img2 = element("img");
    			t36 = space();
    			p4 = element("p");
    			p4.textContent = "!";
    			add_location(h20, file$2, 6, 8, 87);
    			add_location(h30, file$2, 7, 8, 115);
    			add_location(p0, file$2, 8, 8, 143);
    			add_location(li0, file$2, 10, 12, 197);
    			add_location(li1, file$2, 11, 12, 232);
    			add_location(ul, file$2, 9, 8, 180);
    			set_style(h40, "cursor", "pointer");
    			set_style(h40, "width", "fit-content");
    			attr_dev(h40, "onclick", "this.style.color = 'me' == 'me' ? 'green' : 'red'");
    			attr_dev(h40, "data-tooltip", "Click to see the truth !");
    			add_location(h40, file$2, 13, 8, 268);
    			add_location(h31, file$2, 20, 8, 560);
    			add_location(p1, file$2, 21, 8, 583);
    			attr_dev(div0, "class", "part");
    			add_location(div0, file$2, 5, 4, 60);
    			add_location(h21, file$2, 24, 8, 644);
    			set_style(h41, "color", "blue");
    			add_location(h41, file$2, 26, 12, 734);
    			attr_dev(a0, "href", "https://its-just-nans.github.io/golb/");
    			add_location(a0, file$2, 25, 8, 673);
    			set_style(h42, "color", "blue");
    			add_location(h42, file$2, 29, 12, 856);
    			attr_dev(a1, "href", "https://its-just-nans.github.io/rt/");
    			add_location(a1, file$2, 28, 8, 797);
    			attr_dev(div1, "class", "part");
    			add_location(div1, file$2, 23, 4, 617);
    			add_location(h22, file$2, 33, 8, 960);
    			attr_dev(div2, "class", "center svelte-17kqt4i");
    			add_location(div2, file$2, 34, 8, 987);
    			add_location(br, file$2, 47, 8, 1443);
    			add_location(h32, file$2, 49, 12, 1515);
    			attr_dev(img0, "class", "svgGithubStat svelte-17kqt4i");
    			attr_dev(img0, "alt", "");
    			if (!src_url_equal(img0.src, img0_src_value = "https://github-readme-stats.vercel.app/api?username=its-just-nans&hide_border=true&show_icons=true")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$2, 51, 16, 1586);
    			attr_dev(div3, "class", "inline svelte-17kqt4i");
    			add_location(div3, file$2, 50, 12, 1549);
    			attr_dev(img1, "class", "svgGithubStat svelte-17kqt4i");
    			attr_dev(img1, "alt", "");
    			if (!src_url_equal(img1.src, img1_src_value = "https://github-readme-stats.vercel.app/api/top-langs/?username=its-just-nans&layout=compact&hide_border=true&show_icons=true")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$2, 58, 16, 1872);
    			attr_dev(div4, "class", "inline svelte-17kqt4i");
    			add_location(div4, file$2, 57, 12, 1835);
    			attr_dev(div5, "class", "center svelte-17kqt4i");
    			set_style(div5, "margin-top", "20px");
    			add_location(div5, file$2, 48, 8, 1458);
    			attr_dev(div6, "class", "part");
    			add_location(div6, file$2, 32, 4, 933);
    			add_location(h23, file$2, 67, 8, 2199);
    			attr_dev(p2, "class", "inline svelte-17kqt4i");
    			add_location(p2, file$2, 69, 12, 2254);
    			attr_dev(p3, "class", "inline svelte-txt svelte-17kqt4i");
    			add_location(p3, file$2, 71, 16, 2360);
    			attr_dev(img2, "class", "inline svelte-logo svelte-17kqt4i");
    			if (!src_url_equal(img2.src, img2_src_value = "https://svelte.dev/favicon.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$2, 72, 16, 2416);
    			attr_dev(a2, "href", "https://svelte.dev");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$2, 70, 12, 2298);
    			attr_dev(p4, "class", "inline svelte-17kqt4i");
    			add_location(p4, file$2, 78, 12, 2600);
    			add_location(div7, file$2, 68, 8, 2236);
    			attr_dev(div8, "class", "part center svelte-17kqt4i");
    			add_location(div8, file$2, 66, 4, 2165);
    			add_location(article, file$2, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, h30);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(div0, t9);
    			append_dev(div0, h40);
    			append_dev(div0, t11);
    			append_dev(div0, h31);
    			append_dev(div0, t13);
    			append_dev(div0, p1);
    			append_dev(article, t15);
    			append_dev(article, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t17);
    			append_dev(div1, a0);
    			append_dev(a0, h41);
    			append_dev(div1, t19);
    			append_dev(div1, a1);
    			append_dev(a1, h42);
    			append_dev(article, t21);
    			append_dev(article, div6);
    			append_dev(div6, h22);
    			append_dev(div6, t23);
    			append_dev(div6, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div6, t24);
    			append_dev(div6, br);
    			append_dev(div6, t25);
    			append_dev(div6, div5);
    			append_dev(div5, h32);
    			append_dev(div5, t27);
    			append_dev(div5, div3);
    			append_dev(div3, img0);
    			append_dev(div5, t28);
    			append_dev(div5, div4);
    			append_dev(div4, img1);
    			append_dev(article, t29);
    			append_dev(article, div8);
    			append_dev(div8, h23);
    			append_dev(div8, t31);
    			append_dev(div8, div7);
    			append_dev(div7, p2);
    			append_dev(div7, t33);
    			append_dev(div7, a2);
    			append_dev(a2, p3);
    			append_dev(a2, t35);
    			append_dev(a2, img2);
    			append_dev(div7, t36);
    			append_dev(div7, p4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	let { data = [] } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get data() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Links.svelte generated by Svelte v3.45.0 */

    const file$1 = "src/Links.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (11:20) {#each data as oneLink, index}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let a0;
    	let img;
    	let img_src_value;
    	let a0_href_value;
    	let t0;
    	let td1;
    	let a1;
    	let t1_value = /*oneLink*/ ctx[2].link + "";
    	let t1;
    	let a1_href_value;
    	let t2;
    	let td2;
    	let span;
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[1](/*oneLink*/ ctx[2]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			td1 = element("td");
    			a1 = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			td2 = element("td");
    			span = element("span");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t3 = space();
    			if (!src_url_equal(img.src, img_src_value = /*oneLink*/ ctx[2].ico)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "iconSmall");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 14, 36, 403);
    			attr_dev(a0, "href", a0_href_value = /*oneLink*/ ctx[2].link);
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$1, 13, 32, 327);
    			add_location(td0, file$1, 12, 28, 290);
    			attr_dev(a1, "href", a1_href_value = /*oneLink*/ ctx[2].link);
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$1, 22, 32, 774);
    			attr_dev(td1, "class", "wordBreak hoverBlue");
    			add_location(td1, file$1, 21, 28, 709);
    			attr_dev(path0, "d", "M10 19h8V8h-8v11zM8 7.992C8 6.892 8.902 6 10.009 6h7.982C19.101 6 20 6.893 20 7.992v11.016c0 1.1-.902 1.992-2.009 1.992H10.01A2.001 2.001 0 0 1 8 19.008V7.992z");
    			add_location(path0, file$1, 41, 45, 1754);
    			attr_dev(path1, "d", "M5 16V4.992C5 3.892 5.902 3 7.009 3H15v13H5zm2 0h8V5H7v11z");
    			add_location(path1, file$1, 43, 46, 2018);
    			add_location(g, file$1, 40, 41, 1706);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "class", "copyIcon");
    			add_location(svg, file$1, 34, 37, 1382);
    			add_location(span, file$1, 33, 32, 1339);
    			add_location(td2, file$1, 27, 28, 1035);
    			add_location(tr, file$1, 11, 24, 257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a0);
    			append_dev(a0, img);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, a1);
    			append_dev(a1, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, span);
    			append_dev(span, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(tr, t3);

    			if (!mounted) {
    				dispose = listen_dev(td2, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 1 && !src_url_equal(img.src, img_src_value = /*oneLink*/ ctx[2].ico)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 1 && a0_href_value !== (a0_href_value = /*oneLink*/ ctx[2].link)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*oneLink*/ ctx[2].link + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*data*/ 1 && a1_href_value !== (a1_href_value = /*oneLink*/ ctx[2].link)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(11:20) {#each data as oneLink, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let article;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let table;
    	let tbody;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Links";
    			t1 = space();
    			div0 = element("div");
    			table = element("table");
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$1, 6, 8, 87);
    			add_location(tbody, file$1, 9, 16, 174);
    			add_location(table, file$1, 8, 12, 150);
    			attr_dev(div0, "class", "overflowTable svelte-10a4iwp");
    			add_location(div0, file$1, 7, 8, 110);
    			attr_dev(div1, "class", "part");
    			add_location(div1, file$1, 5, 4, 60);
    			add_location(article, file$1, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, table);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*copy, data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Links', slots, []);
    	let { data = [] } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Links> was created with unknown prop '${key}'`);
    	});

    	const click_handler = oneLink => {
    		copy(oneLink.link);
    	}; // smollPopUp({ title: "Copied", msg: "" }, { type: "ok" });

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, click_handler];
    }

    class Links extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Links",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get data() {
    		throw new Error("<Links>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Links>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const jsonFetch = async (url) => {
        try {
            const resp = await fetch(url);
            return resp.json();
        } catch (e) { }
    };

    const nav = [
        {
            name: "About",
            route: "about",
            component: About,
            getData: async () => jsonFetch(`https://n4n5.dev/data/?file=languages.json`)
        },
        {
            name: "Projects",
            route: "projects",
            component: Projects,
            getData: async () => jsonFetch(`https://n4n5.dev/data/?file=projects.json`),
        },
        {
            name: "History",
            route: "history",
            component: History,
            getData: async () => jsonFetch(`https://n4n5.dev/data/?file=history.json`),
        },
        {
            name: "Links",
            route: "links",
            component: Links,
            getData: async () => jsonFetch(`https://n4n5.dev/data/?file=links.json`),
        }
    ];

    /* src/App.svelte generated by Svelte v3.45.0 */
    const file = "src/App.svelte";

    // (51:4) {#key actualNav}
    function create_key_block(ctx) {
    	let switch_instance;
    	let updating_data;
    	let switch_instance_anchor;
    	let current;

    	function switch_instance_data_binding(value) {
    		/*switch_instance_data_binding*/ ctx[4](value);
    	}

    	var switch_value = /*actualNav*/ ctx[1].component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		if (/*data*/ ctx[2][/*actualNav*/ ctx[1].route] !== void 0) {
    			switch_instance_props.data = /*data*/ ctx[2][/*actualNav*/ ctx[1].route];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'data', switch_instance_data_binding));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (!updating_data && dirty & /*data, actualNav*/ 6) {
    				updating_data = true;
    				switch_instance_changes.data = /*data*/ ctx[2][/*actualNav*/ ctx[1].route];
    				add_flush_callback(() => updating_data = false);
    			}

    			if (switch_value !== (switch_value = /*actualNav*/ ctx[1].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'data', switch_instance_data_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(51:4) {#key actualNav}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let t;
    	let main;
    	let previous_key = /*actualNav*/ ctx[1];
    	let current;

    	header = new Header({
    			props: {
    				globalColor: /*color*/ ctx[0],
    				title: "Its-Just-Nans",
    				actualNav: /*changeNav*/ ctx[3],
    				nav
    			},
    			$$inline: true
    		});

    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			main = element("main");
    			key_block.c();
    			set_style(main, "--globalColor", /*color*/ ctx[0]);
    			add_location(main, file, 49, 0, 1573);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			key_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*color*/ 1) header_changes.globalColor = /*color*/ ctx[0];
    			header.$set(header_changes);

    			if (dirty & /*actualNav*/ 2 && safe_not_equal(previous_key, previous_key = /*actualNav*/ ctx[1])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(main, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(main, "--globalColor", /*color*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const getRandomColor = function () {
    		var letters = "9ABCDEF";
    		var color = "#";

    		for (var i = 0; i < 6; i++) {
    			color += letters[Math.floor(Math.random() * letters.length)];
    		}

    		return color;
    	};

    	window.onhashchange = () => {
    		if (window.location.hash.substring(1) !== actualNav.route) {
    			changeNav();
    		}
    	};

    	let color = getRandomColor();

    	setInterval(
    		() => {
    			$$invalidate(0, color = getRandomColor());
    		},
    		5000
    	);

    	let actualNav = {};

    	async function changeNav(index = -1) {
    		if (index == -1) {
    			let hash = window.location.hash;
    			hash = hash.substring(1);
    			const newIndex = nav.findIndex(element => element.route === hash);
    			index = newIndex === -1 ? 0 : newIndex;
    		} else {
    			if (nav[index].route == actualNav.route) {
    				// prevent from re-clicking
    				// the re-build of a component can be useful sometimes
    				return;
    			}
    		}

    		$$invalidate(1, actualNav = nav[index]);
    		const hash = nav[index].route;
    		window.location.hash = hash;

    		if (typeof data[actualNav.route] === "undefined") {
    			// we load data
    			const newData = await nav[index].getData();

    			$$invalidate(2, data[actualNav.route] = newData, data);
    		}
    	}

    	let data = {};
    	changeNav();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_data_binding(value) {
    		if ($$self.$$.not_equal(data[actualNav.route], value)) {
    			data[actualNav.route] = value;
    			$$invalidate(2, data);
    		}
    	}

    	$$self.$capture_state = () => ({
    		Header,
    		nav,
    		getRandomColor,
    		color,
    		actualNav,
    		changeNav,
    		data
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('actualNav' in $$props) $$invalidate(1, actualNav = $$props.actualNav);
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, actualNav, data, changeNav, switch_instance_data_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

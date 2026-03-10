import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('wire-sortable initialization', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        window.Livewire = undefined;
    });

    it('should export initSortable and Sortable', async () => {
        const mod = await import('../src/index.js');
        expect(typeof mod.initSortable).toBe('function');
        expect(mod.Sortable).toBeDefined();
    });

    it('should find elements with wire:sortable attribute', async () => {
        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder">
                    <div wire:sortable.item="1">Item 1</div>
                    <div wire:sortable.item="2">Item 2</div>
                </div>
            </div>
        `;

        const { initSortable } = await import('../src/index.js');
        initSortable();

        const sortableEl = document.querySelector('[wire\\:sortable]');
        expect(sortableEl).not.toBeNull();
    });

    it('should parse custom options from wire:sortable.options', async () => {
        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder" wire:sortable.options='{"animation": 300, "delay": 50}'>
                    <div wire:sortable.item="1">Item 1</div>
                </div>
            </div>
        `;

        const { initSortable } = await import('../src/index.js');
        initSortable();

        const sortableEl = document.querySelector('[wire\\:sortable]');
        expect(sortableEl).not.toBeNull();
    });

    it('should warn on invalid JSON in options', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder" wire:sortable.options="not valid json">
                    <div wire:sortable.item="1">Item 1</div>
                </div>
            </div>
        `;

        const { initSortable } = await import('../src/index.js');
        initSortable();

        expect(warnSpy).toHaveBeenCalledWith(
            '[wire-sortable] Invalid JSON in wire:sortable.options:',
            'not valid json'
        );

        warnSpy.mockRestore();
    });

    it('should detect drag handles', async () => {
        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder">
                    <div wire:sortable.item="1">
                        <span wire:sortable.handle>::</span>
                        Item 1
                    </div>
                    <div wire:sortable.item="2">
                        <span wire:sortable.handle>::</span>
                        Item 2
                    </div>
                </div>
            </div>
        `;

        const { initSortable } = await import('../src/index.js');
        initSortable();

        const handleEl = document.querySelector('[wire\\:sortable\\.handle]');
        expect(handleEl).not.toBeNull();
    });

    it('should support group attribute for multi-container', async () => {
        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder" wire:sortable.group="board" wire:sortable.container="todo">
                    <div wire:sortable.item="1">Item 1</div>
                </div>
                <div wire:sortable="updateOrder" wire:sortable.group="board" wire:sortable.container="done">
                    <div wire:sortable.item="2">Item 2</div>
                </div>
            </div>
        `;

        const { initSortable } = await import('../src/index.js');
        initSortable();

        const containers = document.querySelectorAll('[wire\\:sortable]');
        expect(containers.length).toBe(2);
        expect(containers[0].getAttribute('wire:sortable.container')).toBe('todo');
        expect(containers[1].getAttribute('wire:sortable.container')).toBe('done');
    });

    it('should clean up sortables on re-init', async () => {
        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder">
                    <div wire:sortable.item="1">Item 1</div>
                </div>
            </div>
        `;

        const { initSortable } = await import('../src/index.js');
        initSortable();
        initSortable();

        const sortableEl = document.querySelector('[wire\\:sortable]');
        expect(sortableEl).not.toBeNull();
    });

    it('should respond to reinit-sortable event', async () => {
        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder">
                    <div wire:sortable.item="1">Item 1</div>
                </div>
            </div>
        `;

        await import('../src/index.js');

        expect(() => {
            document.dispatchEvent(new Event('reinit-sortable'));
        }).not.toThrow();
    });

    it('should use default group name when none specified', async () => {
        document.body.innerHTML = `
            <div wire:id="123">
                <div wire:sortable="updateOrder">
                    <div wire:sortable.item="1">Item 1</div>
                </div>
            </div>
        `;

        const { initSortable } = await import('../src/index.js');
        initSortable();

        const el = document.querySelector('[wire\\:sortable]');
        expect(el.getAttribute('wire:sortable.group')).toBeNull();
    });
});

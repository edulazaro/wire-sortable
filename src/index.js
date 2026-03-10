import { Sortable, Swap } from 'sortablejs/modular/sortable.core.esm';

Sortable.mount(new Swap());

const activeSortables = [];

function initSortable() {
    activeSortables.forEach((sortable) => sortable.destroy());
    activeSortables.length = 0;

    document.querySelectorAll('[wire\\:sortable]').forEach((el) => {
        const method = el.getAttribute('wire:sortable');
        const groupName = el.getAttribute('wire:sortable.group') ?? 'default';

        let customOptions = {};
        const optionsAttr = el.getAttribute('wire:sortable.options');
        if (optionsAttr) {
            try {
                customOptions = JSON.parse(optionsAttr);
            } catch (e) {
                console.warn('[wire-sortable] Invalid JSON in wire:sortable.options:', optionsAttr);
            }
        }

        const hasHandles = !!el.querySelector(':scope > [wire\\:sortable\\.item] [wire\\:sortable\\.handle]');

        const sortable = Sortable.create(el, {
            handle: hasHandles ? '[wire\\:sortable\\.handle]' : undefined,
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            ...customOptions,
            group: {
                name: groupName,
                pull: true,
                put: function (to, from) {
                    return from.options.group.name === to.options.group.name;
                },
            },
            onEnd: (evt) => {
                const items = [...evt.to.children]
                    .filter((child) => child.hasAttribute('wire:sortable.item'))
                    .map((child, index) => ({
                        order: index + 1,
                        value: child.getAttribute('wire:sortable.item'),
                    }));

                const component = evt.to.closest('[wire\\:id]');
                if (!component) return;

                const livewireComponent = window.Livewire.find(component.getAttribute('wire:id'));
                if (!livewireComponent) return;

                const toContainer = evt.to.getAttribute('wire:sortable.container');
                const fromContainer = evt.from.getAttribute('wire:sortable.container');

                livewireComponent.call(method, items, toContainer, fromContainer);
            },
        });

        activeSortables.push(sortable);
    });
}

function deferredInit() {
    requestAnimationFrame(() => {
        requestAnimationFrame(initSortable);
    });
}

document.addEventListener('livewire:navigated', initSortable);
document.addEventListener('livewire:update', deferredInit);
document.addEventListener('reinit-sortable', deferredInit);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSortable);
} else {
    initSortable();
}

export { initSortable, Sortable };

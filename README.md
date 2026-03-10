<p align="center">
    <strong>wire-sortable</strong>
</p>

<p align="center">
    Drag and drop sorting for <a href="https://livewire.laravel.com/">Livewire</a>, powered by <a href="https://sortablejs.github.io/Sortable/">SortableJS</a>.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/wire-sortable"><img src="https://img.shields.io/npm/v/wire-sortable.svg" alt="npm version"></a>
    <a href="https://www.npmjs.com/package/wire-sortable"><img src="https://img.shields.io/npm/dm/wire-sortable.svg" alt="npm downloads"></a>
    <a href="https://github.com/edulazaro/wire-sortable/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/wire-sortable.svg" alt="license"></a>
    <a href="https://bundlephobia.com/package/wire-sortable"><img src="https://img.shields.io/bundlephobia/minzip/wire-sortable" alt="bundle size"></a>
</p>

---

## Why wire-sortable?

Livewire doesn't ship with built-in drag and drop support. The official `livewire-sortable` package relies on Shopify Draggable, which is heavier, less actively maintained, and has known issues with `wire:navigate` and Livewire 3+ lifecycle events.

**wire-sortable** is a lightweight alternative built on [SortableJS](https://github.com/SortableJS/Sortable), the most widely used drag and drop library in the JavaScript ecosystem. It integrates seamlessly with Livewire using simple HTML attributes: no PHP package required, no configuration needed. Just import and go.

| | wire-sortable | livewire-sortable (official) |
|---|---|---|
| Engine | SortableJS (actively maintained) | Shopify Draggable (less active) |
| Multi-container | `wire:sortable.group` + `wire:sortable.container` | `wire:sortable-group` (separate API) |
| Custom options | `wire:sortable.options` | Limited |
| Swap mode | Built-in | No |
| Bundle size | ~36 KB min | ~60 KB min |
| Livewire 3+ | Yes | Yes |
| `wire:navigate` | Yes | Partial |

## Installation

```bash
npm install wire-sortable
```

Import in your JavaScript entry file:

```js
// resources/js/app.js
import 'wire-sortable';
```

That's it. No service providers, no config files.

## Quick Start

### 1. Simple list sorting

```php
// app/Livewire/TodoList.php
class TodoList extends Component
{
    public $todos;

    public function mount()
    {
        $this->todos = Todo::orderBy('order')->get();
    }

    public function updateOrder($items)
    {
        foreach ($items as $item) {
            Todo::find($item['value'])->update(['order' => $item['order']]);
        }
    }
}
```

```html
<ul wire:sortable="updateOrder">
    @foreach($todos as $todo)
        <li wire:sortable.item="{{ $todo->id }}" wire:key="todo-{{ $todo->id }}">
            {{ $todo->title }}
        </li>
    @endforeach
</ul>
```

### 2. With drag handles

Only the handle element triggers dragging:

```html
<ul wire:sortable="updateOrder">
    @foreach($items as $item)
        <li wire:sortable.item="{{ $item->id }}" wire:key="item-{{ $item->id }}"
            class="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
            <span wire:sortable.handle class="cursor-grab text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
            </span>
            <span>{{ $item->name }}</span>
        </li>
    @endforeach
</ul>
```

### 3. Kanban board (multi-container)

Drag items between columns:

```php
public function updateTaskOrder($items, $toStatus, $fromStatus)
{
    foreach ($items as $item) {
        Task::find($item['value'])->update([
            'order' => $item['order'],
            'status' => $toStatus,
        ]);
    }

    $this->tasks = Task::orderBy('order')->get()->groupBy('status');
}
```

```html
<div class="grid grid-cols-3 gap-4">
    @foreach(['backlog', 'in_progress', 'done'] as $status)
        <div class="bg-gray-100 rounded-lg p-4">
            <h3 class="font-bold mb-3">{{ ucfirst($status) }}</h3>

            <div wire:sortable="updateTaskOrder"
                 wire:sortable.group="board"
                 wire:sortable.container="{{ $status }}"
                 class="space-y-2 min-h-[100px]">

                @foreach($tasks[$status] ?? [] as $task)
                    <div wire:sortable.item="{{ $task->id }}" wire:key="task-{{ $task->id }}"
                         class="p-3 bg-white rounded shadow">
                        {{ $task->title }}
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach
</div>
```

### 4. Image gallery reordering

```html
<div wire:sortable="reorderImages"
     wire:sortable.options='{"animation": 200, "ghostClass": "opacity-30"}'
     class="grid grid-cols-4 gap-2">
    @foreach($images as $image)
        <div wire:sortable.item="{{ $image->id }}" wire:key="img-{{ $image->id }}">
            <img src="{{ $image->url }}" class="rounded-lg" />
        </div>
    @endforeach
</div>
```

## Directives

| Directive | Description |
|---|---|
| `wire:sortable="method"` | Livewire method called on sort. Receives `($items, $toContainer, $fromContainer)` |
| `wire:sortable.item="id"` | Marks an element as sortable. The value is passed in the `$items` array |
| `wire:sortable.handle` | Only this element triggers dragging (optional) |
| `wire:sortable.group="name"` | Groups containers: items can only move between containers with the same group |
| `wire:sortable.container="id"` | Identifies the container, passed as `$toContainer` / `$fromContainer` |
| `wire:sortable.options='JSON'` | Custom [SortableJS options](https://github.com/SortableJS/Sortable#options) as JSON |

## The `$items` array

Your Livewire method receives an array of items in their new order:

```php
public function updateOrder($items, $toContainer = null, $fromContainer = null)
{
    // $items = [
    //     ['order' => 1, 'value' => '42'],
    //     ['order' => 2, 'value' => '17'],
    //     ['order' => 3, 'value' => '8'],
    // ]
}
```

## Custom options

Pass any [SortableJS option](https://github.com/SortableJS/Sortable#options) via `wire:sortable.options`:

```html
<div wire:sortable="updateOrder"
     wire:sortable.options='{
         "animation": 300,
         "delay": 100,
         "delayOnTouchOnly": true,
         "ghostClass": "opacity-50",
         "chosenClass": "ring-2 ring-blue-500",
         "dragClass": "shadow-2xl"
     }'>
```

### Default options

| Option | Default |
|---|---|
| `animation` | `150` |
| `ghostClass` | `sortable-ghost` |
| `chosenClass` | `sortable-chosen` |

## Styling

```css
/* Placeholder shown where the item will be dropped */
.sortable-ghost {
    opacity: 0.4;
    background: #f0f9ff;
}

/* The element being dragged */
.sortable-chosen {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

Or use Tailwind classes directly via options:

```html
wire:sortable.options='{"ghostClass": "opacity-30 bg-blue-50", "chosenClass": "shadow-xl"}'
```

## Programmatic re-initialization

When dynamically adding sortable containers after the initial render:

```js
document.dispatchEvent(new Event('reinit-sortable'));
```

## Advanced: Access SortableJS directly

```js
import { Sortable, initSortable } from 'wire-sortable';

// Use Sortable directly for custom implementations
const el = document.getElementById('my-list');
Sortable.create(el, { /* options */ });

// Manually re-initialize all wire:sortable elements
initSortable();
```

## Requirements

- Livewire 3+
- A JavaScript bundler (Vite, Webpack, esbuild, etc.)

## CDN Usage

For projects without a build step:

```html
<script src="https://unpkg.com/wire-sortable@latest/dist/wire-sortable.min.js"></script>
```

## Author

[Edu Lazaro](https://edulazaro.com)

## License

[MIT](LICENSE)

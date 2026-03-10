import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/wire-sortable.esm.js',
            format: 'esm',
        },
        plugins: [resolve()],
    },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/wire-sortable.js',
            format: 'umd',
            name: 'WireSortable',
        },
        plugins: [resolve()],
    },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/wire-sortable.min.js',
            format: 'umd',
            name: 'WireSortable',
        },
        plugins: [resolve(), terser()],
    },
];

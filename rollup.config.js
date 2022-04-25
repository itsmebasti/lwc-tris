import lwc from '@lwc/rollup-plugin';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import livereload from 'rollup-plugin-livereload';


const prod = (process.env.NODE_ENV === 'production');
const watch = (process.env.ROLLUP_WATCH);

export default [
    {
        input: 'src/index.js',
        preserveEntrySignatures: false,
        output: {
            dir: 'dist',
            format: 'esm',
        },
        watch: {
            clearScreen: false,
            include: 'src/**'
        },
        plugins: [
            nodeResolve(), // note: needed to resolve firebase subdirectory imports
            lwc({ modules: [
                { dir: "modules" },
                { npm: "lightning-base-components" },
            ]}),
            copy({
                targets: [
                    { src: 'src/index.html', dest: 'dist' },
                    { src: 'src/assets', dest: 'dist' },
                ]
            }),
            replace({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }),
            prod && terser(),
            watch && serve('dist'),
            watch && livereload({ watch: 'dist', delay: 400 })
        ].filter(Boolean)
    },
];


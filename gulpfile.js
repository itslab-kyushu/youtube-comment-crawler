//
// gulpfile.js
//
// Copyright (c) 2017 Junpei Kawamoto
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
const gulp = require("gulp");
const babel = require("gulp-babel");
const chmod = require("gulp-chmod");
const del = require("del");

const conf = {
    src: "src",
    dest: "lib",
    bin: "bin"
};

gulp.task("default", ["build"]);
gulp.task("build", ["babel", "bin"]);

// Clean destination.
gulp.task("clean", () => {
    return del([`${conf.dest}/**/*`, `${conf.bin}/**/*`]);
});

// Transpile Js files.
gulp.task("babel", ["clean"], () => {
    return gulp.src([`${conf.src}/*.js`, `!${conf.src}/cli.js`])
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(gulp.dest(`${conf.dest}/`));
});

// Transpile cli.js.
gulp.task("bin", ["clean"], () => {
    return gulp.src(`${conf.src}/cli.js`)
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(chmod(0o755))
        .pipe(gulp.dest(`${conf.bin}/`));
});
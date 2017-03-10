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
const del = require("del");
const babel = require("gulp-babel");
const pug = require("gulp-pug");
const uglify = require("gulp-uglify");
const htmlmin = require("gulp-htmlmin");

const conf = {
    src: "src",
    dest: "lib",
    prod: false
};

gulp.task("default", ["build"]);
gulp.task("build", ["babel", "views"]);

// Set production mode.
gulp.task("prod", () => conf.prod = true);

// Clean destination.
gulp.task("clean", () => {
    return del([`${conf.dest}/**/*`]);
});

// Transpile Js files.
gulp.task("babel", ["clean"], () => {
    let p = gulp.src(`${conf.src}/*.js`)
        .pipe(babel({
            presets: ["es2015"]
        }));
    if (conf.prod) {
        p = p.pipe(uglify());
    }
    return p.pipe(gulp.dest(`${conf.dest}/`));
});

// Compile Pug templates.
gulp.task("views", ["clean"], () => {
    let p = gulp.src(`${conf.src}/*.pug`)
        .pipe(pug());
    if (conf.prod) {
        p = p.pipe(htmlmin({
            collapseWhitespace: true
        }));
    }
    return p.pipe(gulp.dest(`${conf.dest}/`));
});

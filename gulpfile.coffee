gulp = require "gulp"
jade = require "gulp-jade"
inject = require "gulp-inject"
uglify = require "gulp-uglify"
del = require "del"
browserify = require "browserify"
parcelify = require "parcelify"
source = require "vinyl-source-stream"
buffer = require "vinyl-buffer"

rework = require "gulp-rework"
reworkNPM = require "rework-npm"

conf =
  src: './src'
  dest: './public'
  prod: false


gulp.task "html", ["browserify", "css"], ->
  ignores = ['public/', 'client/']
  gulp.src "#{conf.src}/client/*.jade"
    .pipe jade pretty: not conf.prod
    .pipe inject(
      gulp.src("#{conf.dest}/bundle/*.js", read: false),
      ignorePath: ignores
      relative: true
      transform: (filepath) ->
        filename = filepath.split("/").pop()
        "<script src=\"/bundle/#{filename}\" defer=\"defer\"></script>"
    )
    .pipe inject(
      gulp.src("#{conf.dest}/bundle/*.css", read: false),
      ignorePath: ignores
    )
    .pipe gulp.dest "#{conf.dest}/"


gulp.task 'clean', ->
  del [
      "#{conf.dest}/**/*"
  ]


gulp.task 'browserify', ['clean'], ->
  b = browserify
    entries: ["#{conf.src}/client/main.cjsx"]
    extensions: ['.coffee', ".cjsx"]
  parcelify b,
    bundles:
      style: "#{conf.dest}/bundle/bundle.css"
  p = b.bundle()
        .pipe source 'bundle.js'
  if conf.prod
    p = p.pipe buffer()
          .pipe uglify()
  p.pipe gulp.dest "#{conf.dest}/bundle/"


gulp.task "css", ["clean"], ->
  gulp.src "#{conf.src}/client/*.css"
    .pipe rework(reworkNPM())
    .pipe gulp.dest "#{conf.dest}/bundle/"


gulp.task 'build', ["html"]


gulp.task 'prod', ->
  conf.prod = true


gulp.task 'default', ['build']

const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const zip = require('gulp-zip');
const sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');
const jasmine = require('gulp-jasmine');
const istanbul = require('gulp-istanbul');
const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

const mainDir = process.cwd();

gulp.task('clean', cb => {
    del(['dist', 'release'], cb);
});

const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
    
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('copyassets', () => {
    return gulp.src('assets/**/*')
        .pipe(gulp.dest('dist/assets'));
});

gulp.task('testcopyassets', () => {
    return gulp.src('spec/assets/**/*')
        .pipe(gulp.dest('dist/spec/assets'));
});

gulp.task('testcopyjasmineconfig', () => {
    return gulp.src('spec/support/**/*')
        .pipe(gulp.dest('dist/spec/support'));
});

gulp.task('build', ['scripts', 'copyassets', 'testcopyassets', 'testcopyjasmineconfig']);

gulp.task('pre-test', ['build'], () => {
    process.chdir('dist');
    return gulp.src(['**/*.js', '!spec/**/*'])
        .pipe(istanbul({ includeUntested: true }))
        .pipe(istanbul.hookRequire());
});

gulp.task('run-test', ['pre-test'], (done) => {
    fs.readFile('spec/support/jasmine.json', 'utf8', (err, jasmineConfig) => {
        if (err != null) {
            done(err);
            return;
        }
        gulp.src('spec/**/*[sS]pec.js')
            .pipe(jasmine({ verbose: true, config: JSON.parse(jasmineConfig) }))
            .pipe(istanbul.writeReports())
            // Not listening on 'jasmineDone' due to istanbul (i.e. not doing ".on('jasmineDone', () => done());")
            .on('end', () => done());
    });
});

gulp.task('test', ['run-test'], () => {
    return gulp.src('coverage/coverage-final.json')
        .pipe(remapIstanbul({
            exclude: /assets/,
            reports: {
                html: 'coverage/coverage-remapped/lcov-report'
            }
        }))
        .pipe(gulp.dest('coverage/coverage-remapped'));
});

gulp.task('release-package', ['test'], () => {
    process.chdir(mainDir);
    return gulp.src(['dist/**/*', '!dist/spec/**/*', '!dist/[s]pec', '!dist/coverage/**/*', '!dist/[c]overage', '!dist/target/**/*', '!dist/[t]arget', '[n]ode_modules/**/*'])
        .pipe(gulp.dest('release/promotion-tool'));
});

gulp.task('release-zip', ['release-package'], () => {
    return gulp.src('release/promotion-tool/**/*')
        .pipe(zip('promotion-tool.zip'))
        .pipe(gulp.dest('release'));
});

gulp.task('release', ['release-zip']);

gulp.task('watch', ['scripts'], () => {
    gulp.watch('**/*.ts', ['scripts']);
});

gulp.task('default', ['build']);

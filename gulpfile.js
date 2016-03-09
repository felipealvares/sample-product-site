/** ------------------------------------------------------------------
 * Este arquivo é reponsável pelas regras de automatização de tarefas.
 * -------------------------------------------------------------------
 */

/**
 * Definição dos plugins que serão iniciados e todos os plugins
 * instânciados que vão ser utilizados nete arquivo devem estar
 * no package.json.
 */
var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	cssminify = require('gulp-cssnano'),
	imagemin = require('gulp-imagemin'),
	spritesmith = require('gulp.spritesmith'),
	sourcemaps = require('gulp-sourcemaps'),
	plumber = require('gulp-plumber'),
	concat = require('gulp-concat'),
	wrap = require('gulp-wrap'),
	declare = require('gulp-declare'),
	rimraf = require('rimraf'),
	browserSync = require('browser-sync'),
	argv = require('yargs').argv,
	hostPort = argv.port || 1000,
	hostLocal = 'http://localhost:' + hostPort;


/**
 * Configuração dos diretórios para facilitar os diretórios,
 * Source: Arquivos de desenvolvimento | Public: Arquivos finais.
 */
var web_source = 'source/web/',
	web_public = 'public/web/';

var admin_source = 'source/admin/',
	admin_public = 'public/admin/'

var CONFIG = {
	PATH_WEB : {
		SCRIPTS : {
			ROOT: web_source + 'scripts/',
			SRC: web_source + 'scripts/',
			DEST: web_public + 'scripts/'
		},
		STYLES: {
			ROOT: web_source + 'styles/',
			SCSS: web_source + 'styles/',
			DEST: web_public + 'styles/'
		},
		IMAGES: {
			ROOT: web_source + 'images/',
			SPRITE: web_source + 'images/sprite/',
			DEST: web_public + 'images/'
		}
	},
	PATH_ADMIN : {
		SCRIPTS : {
			ROOT: admin_source + 'scripts/',
			SRC: admin_source + 'scripts/',
			DEST: admin_public + 'scripts/'
		},
		STYLES: {
			ROOT: admin_source + 'styles/',
			SCSS: admin_source + 'styles/',
			DEST: admin_public + 'styles/'
		},
		IMAGES: {
			ROOT: admin_source + 'images/',
			SPRITE: admin_source + 'images/sprite/',
			DEST: admin_public + 'images/'
		}
	}
};

/////////////////////////////////////////////////////////////////////
// WEB
/////////////////////////////////////////////////////////////////////

/**
 * Difinição das tarefas.
 */

// Responsável pela sincronização de arquivos com o navegador.
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: ['', 'public']
		},
		options: {
			reloadDelay: 250
		},
		notify: false,
		port: hostPort
	});
});

// Responsável pela compilação dos arquivos SCSS/CSS.
gulp.task('styles', ['images-sprite'], function() {

	// Ordena os arquivos por prioridade.
	return gulp.src([
		CONFIG.PATH_WEB.STYLES.SCSS + 'base/reset.scss',
		CONFIG.PATH_WEB.STYLES.SCSS + 'base/**/*.scss',

		CONFIG.PATH_WEB.STYLES.SCSS + 'sprite.scss',

		CONFIG.PATH_WEB.STYLES.SCSS + 'helpers/**/*.scss',

		CONFIG.PATH_WEB.STYLES.SCSS + 'layout/grids.scss',
		CONFIG.PATH_WEB.STYLES.SCSS + 'layout/**/*.scss',

		CONFIG.PATH_WEB.STYLES.SCSS + 'views/**/*.scss',

		CONFIG.PATH_WEB.STYLES.SCSS + 'plugins/**/*.scss',

		CONFIG.PATH_WEB.STYLES.SCSS + 'common.scss'
	])

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber({
		errorHandler: function (err) {
			console.log(err);
			this.emit('end');
		}
	}))

	// Inicia o sourceMaps
	.pipe(sourcemaps.init())

	// Inclui todos SCSS os arquivos no app.scss.
	.pipe(concat('app-web.scss'))

	// Compila o que foi gerado do concat.
	.pipe(sass({
		errLogToConsole: true
	}))

	// Adiciona os prefixos automaticamente.
	.pipe(autoprefixer({
		browsers: autoPrefixBrowserList,
		cascade: true
	}))

	// Exibe log's de erro.
	.on('error', gutil.log)

	// Minifica e gera o arquivo final app.css.
	.pipe(cssminify('app-web.css'))

	// Gera o sourcemaps do arquivo final app.css.
	.pipe(sourcemaps.write())

	// Salva o arquivo final no diretório específico.
	.pipe(gulp.dest(CONFIG.PATH_WEB.STYLES.DEST))

	// Notifica o browserSync a dar refresh depois de gerar os arquivos concatenados e minificados.
	.pipe(browserSync.reload({stream: true}));
});



// Responsável pela validação e padronização dos arquivos JS.
gulp.task('scripts-jshint', function() {

	// Ordena os arquivos por prioridade.
	return gulp.src([
		CONFIG.PATH_WEB.SCRIPTS.SRC + 'config.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'library/*.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'base/*.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'layout/*.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'modules/*.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'utilities/*.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'common.js'
	])

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber())

	// Executa o jshint.
	.pipe(jshint('.jshintrc'))

	// Cria erros estilizados pelo jshint-stylish.
	.pipe(jshint.reporter('jshint-stylish'))

	// Exibe os erros.
	.on('error', gutil.log)
});

// Responsável pela compilação dos arquivos JS.
gulp.task('scripts-minify', ['scripts-jshint'], function() {

	// Ordena os arquivos por prioridade.
	return gulp.src([
		CONFIG.PATH_WEB.SCRIPTS.SRC + 'config.js',
		CONFIG.PATH_WEB.SCRIPTS.SRC + 'plugins/jquery.min.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'plugins/**/*.js',
        CONFIG.PATH_WEB.SCRIPTS.SRC + 'library/**/*.js',
    	CONFIG.PATH_WEB.SCRIPTS.SRC + 'base/**/*.js',
    	CONFIG.PATH_WEB.SCRIPTS.SRC + 'layout/**/*.js',
    	CONFIG.PATH_WEB.SCRIPTS.SRC + 'modules/**/*.js',
    	CONFIG.PATH_WEB.SCRIPTS.SRC + 'utilities/**/*.js',
    	CONFIG.PATH_WEB.SCRIPTS.SRC + 'common.js'
	])

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber())

	// Inclui todos JS os arquivos no app.scss.
	.pipe(concat('app-web.js'))

	// Responsável pela minificação do JS.
	.pipe(uglify())

	// Exibe log's de erro.
	.on('error', gutil.log)

	// Salva o arquivo final no diretório específico.
	.pipe(gulp.dest(CONFIG.PATH_WEB.SCRIPTS.DEST))

	// Notifica o browserSync a dar refresh depois de gerar os arquivos concatenados e minificados.
	 .pipe(browserSync.reload({stream: true}));
});

// Comprimi as imagens e arquivos svg.
gulp.task('images-minify', ['clean-img', 'images-sprite'], function() {

	// Rota do diretório das imagens.
	gulp.src( ['!' + CONFIG.PATH_WEB.IMAGES.SPRITE, CONFIG.PATH_WEB.IMAGES.ROOT + '**/*', '!' + CONFIG.PATH_WEB.IMAGES.SPRITE + '**/*'] )

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber())

	// Inicia o imagemin e suas pré configurações.
	.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))

	// Salva o arquivo final no diretório específico.
	.pipe(gulp.dest(CONFIG.PATH_WEB.IMAGES.DEST));
});

gulp.task('clean-img', function (cb) {
 return rimraf(CONFIG.PATH_WEB.IMAGES.DEST + '**/*',cb);
});

// Gera o arquivo Sprite.png
gulp.task('images-sprite', function () {
	var spriteData = gulp.src(CONFIG.PATH_WEB.IMAGES.SPRITE + '*.png')
		.pipe(spritesmith({
			imgName: '../images/sprite.png',
			cssName: 'sprite.scss',
			cssFormat: 'css',
			padding: 10,
			cssOpts: {
				cssSelector: function (item) {
					return '.' + item.name;
				},
				padding: 10
			}
		}));

	// Salva a imagem final no diretório específico.
	spriteData.img.pipe(gulp.dest(CONFIG.PATH_WEB.IMAGES.ROOT));

	// Salva o arquivo final no diretório específico.
	spriteData.css.pipe(gulp.dest(CONFIG.PATH_WEB.STYLES.SCSS));

	return spriteData;
});


/////////////////////////////////////////////////////////////////////
// ADMIN
/////////////////////////////////////////////////////////////////////

/**
 * Difinição das tarefas.
 */

// Responsável pela sincronização de arquivos com o navegador.
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: ['', 'public']
		},
		options: {
			reloadDelay: 250
		},
		notify: false,
		port: hostPort
	});
});

// Responsável pela compilação dos arquivos SCSS/CSS.
gulp.task('styles-admin', ['images-sprite'], function() {

	// Ordena os arquivos por prioridade.
	return gulp.src([
		CONFIG.PATH_ADMIN.STYLES.SCSS + 'base/reset.scss',
		CONFIG.PATH_ADMIN.STYLES.SCSS + 'base/**/*.scss',

		CONFIG.PATH_ADMIN.STYLES.SCSS + 'sprite.scss',

		CONFIG.PATH_ADMIN.STYLES.SCSS + 'helpers/**/*.scss',

		CONFIG.PATH_ADMIN.STYLES.SCSS + 'layout/grids.scss',
		CONFIG.PATH_ADMIN.STYLES.SCSS + 'layout/**/*.scss',

		CONFIG.PATH_ADMIN.STYLES.SCSS + 'views/**/*.scss',

		CONFIG.PATH_ADMIN.STYLES.SCSS + 'plugins/**/*.scss',

		CONFIG.PATH_ADMIN.STYLES.SCSS + 'common.scss'
	])

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber({
		errorHandler: function (err) {
			console.log(err);
			this.emit('end');
		}
	}))

	// Inicia o sourceMaps
	.pipe(sourcemaps.init())

	// Inclui todos SCSS os arquivos no app.scss.
	.pipe(concat('app-admin.scss'))

	// Compila o que foi gerado do concat.
	.pipe(sass({
		errLogToConsole: true
	}))

	// Adiciona os prefixos automaticamente.
	.pipe(autoprefixer({
		browsers: autoPrefixBrowserList,
		cascade: true
	}))

	// Exibe log's de erro.
	.on('error', gutil.log)

	// Minifica e gera o arquivo final app.css.
	.pipe(cssminify('app-admin.css'))

	// Gera o sourcemaps do arquivo final app.css.
	.pipe(sourcemaps.write())

	// Salva o arquivo final no diretório específico.
	.pipe(gulp.dest(CONFIG.PATH_ADMIN.STYLES.DEST))

	// Notifica o browserSync a dar refresh depois de gerar os arquivos concatenados e minificados.
	.pipe(browserSync.reload({stream: true}));
});



// Responsável pela validação e padronização dos arquivos JS.
gulp.task('scripts-jshint-admin', function() {

	// Ordena os arquivos por prioridade.
	return gulp.src([
		CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'config.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'library/*.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'base/*.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'layout/*.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'modules/*.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'utilities/*.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'common.js'
	])

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber())

	// Executa o jshint.
	.pipe(jshint('.jshintrc'))

	// Cria erros estilizados pelo jshint-stylish.
	.pipe(jshint.reporter('jshint-stylish'))

	// Exibe os erros.
	.on('error', gutil.log)
});

// Responsável pela compilação dos arquivos JS.
gulp.task('scripts-minify-admin', ['scripts-jshint'], function() {

	// Ordena os arquivos por prioridade.
	return gulp.src([
		CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'config.js',
		CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'plugins/jquery.min.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'plugins/**/*.js',
        CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'library/**/*.js',
    	CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'base/**/*.js',
    	CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'layout/**/*.js',
    	CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'modules/**/*.js',
    	CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'utilities/**/*.js',
    	CONFIG.PATH_ADMIN.SCRIPTS.SRC + 'common.js'
	])

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber())

	// Inclui todos JS os arquivos no app.scss.
	.pipe(concat('app-admin.js'))

	// Responsável pela minificação do JS.
	.pipe(uglify())

	// Exibe log's de erro.
	.on('error', gutil.log)

	// Salva o arquivo final no diretório específico.
	.pipe(gulp.dest(CONFIG.PATH_ADMIN.SCRIPTS.DEST))

	// Notifica o browserSync a dar refresh depois de gerar os arquivos concatenados e minificados.
	 .pipe(browserSync.reload({stream: true}));
});

// Comprimi as imagens e arquivos svg.
gulp.task('images-minify-admin', ['clean-img', 'images-sprite'], function() {

	// Rota do diretório das imagens.
	gulp.src( ['!' + CONFIG.PATH_ADMIN.IMAGES.SPRITE, CONFIG.PATH_ADMIN.IMAGES.ROOT + '**/*', '!' + CONFIG.PATH_ADMIN.IMAGES.SPRITE + '**/*'] )

	// Evita paralizar o watch e exibe erros.
	.pipe(plumber())

	// Inicia o imagemin e suas pré configurações.
	.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))

	// Salva o arquivo final no diretório específico.
	.pipe(gulp.dest(CONFIG.PATH_ADMIN.IMAGES.DEST));
});

gulp.task('clean-img-admin', function (cb) {
 return rimraf(CONFIG.PATH_ADMIN.IMAGES.DEST + '**/*',cb);
});

// Gera o arquivo Sprite.png
gulp.task('images-sprite-admin', function () {
	var spriteData = gulp.src(CONFIG.PATH_ADMIN.IMAGES.SPRITE + '*.png')
		.pipe(spritesmith({
			imgName: '../images/sprite.png',
			cssName: 'sprite.scss',
			cssFormat: 'css',
			padding: 10,
			cssOpts: {
				cssSelector: function (item) {
					return '.' + item.name;
				},
				padding: 10
			}
		}));

	// Salva a imagem final no diretório específico.
	spriteData.img.pipe(gulp.dest(CONFIG.PATH_ADMIN.IMAGES.ROOT));

	// Salva o arquivo final no diretório específico.
	spriteData.css.pipe(gulp.dest(CONFIG.PATH_ADMIN.STYLES.SCSS));

	return spriteData;
});


/**
 * Responsável por vigiar e executar todas as tarefas de:
 * copilação, minificação, padronização e alertas dos módulos
 * (Style, Images, Scripts)
 */
gulp.task('watch', ['browserSync'], function () {

	function reportChange(event) {
		console.log('\nEvent type: ' + event.type); // Adicinar, Alterar ou Deletar.
		console.log('Event path: ' + event.path + '\n'); // O caminho onde foi modificado o arquivo.
	};

	//Html watch
	gulp.watch(['**/*.html']).on('change', function() {
		browserSync.reload();
	});

	//WEB
	//Images watch
	gulp.watch([CONFIG.PATH_WEB.IMAGES.ROOT + '**/*', '!' + CONFIG.PATH_WEB.IMAGES.SPRITE + '**/*'], ['images-minify']);

	//Styles watch
	gulp.watch([CONFIG.PATH_WEB.STYLES.SCSS + '**/*.scss', '!' + CONFIG.PATH_WEB.STYLES.SCSS + 'sprite.scss'], ['styles']).on('change', reportChange);

	//Images watch
	gulp.watch([CONFIG.PATH_WEB.IMAGES.SPRITE + '*.png'], ['styles']);

	//Scripts watch
	gulp.watch(CONFIG.PATH_WEB.SCRIPTS.SRC + '**/*', ['scripts-minify']);


	//ADMIN
	//Images watch
	gulp.watch([CONFIG.PATH_ADMIN.IMAGES.ROOT + '**/*', '!' + CONFIG.PATH_ADMIN.IMAGES.SPRITE + '**/*'], ['images-minify-admin']);

	//Styles watch
	gulp.watch([CONFIG.PATH_ADMIN.STYLES.SCSS + '**/*.scss', '!' + CONFIG.PATH_ADMIN.STYLES.SCSS + 'sprite.scss'], ['styles-admin']).on('change', reportChange);

	//Images watch
	gulp.watch([CONFIG.PATH_ADMIN.IMAGES.SPRITE + '*.png'], ['styles-admin']);

	//Scripts watch
	gulp.watch(CONFIG.PATH_ADMIN.SCRIPTS.SRC + '**/*', ['scripts-minify-admin']);
});

// Task utilizada para chamar o watch
gulp.task('default', ['styles', 'scripts-minify', 'images-minify', 'styles-admin', 'scripts-minify-admin', 'images-minify-admin']);

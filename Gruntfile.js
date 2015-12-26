module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        browserify: {
          dist: {
            files: {
                'lib.js': ['src/js/index.js'],
                'localNotification.js': ['src/js/worker/localNotification.js']
            },
            options: {
                browserifyOptions: {
                    debug: true
                },
                transform: ['jstify']
            }

          }
        },

        uglify: {
            options: {
                mangle: false
            },
            all: {
                files: {
                    'lib.min.js': "lib.js"
                }
            }
        },

        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/scss',
                    src: ['*.scss'],
                    dest: 'css',
                    ext: '.css'
                }]
            }
        },
        
        watch: {
            scripts: {
                files: ["**/*.js", "**/*.tpl", "src/**/*.html"],
                tasks: ["browserify"]
            },
            style: {
                files: "**/*.scss",
                tasks: ["sass"]
            },
        }
    });
    
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['browserify', 'uglify', 'sass']);

};
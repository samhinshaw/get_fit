/* global module:false */
module.exports = grunt => {
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    // banner:
    //   '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
    //   '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    //   '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
    //   '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
    //   ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    sass: {
      dist: {
        files: {
          'public/css/bulma.css': 'sass/custom_bulma.sass'
        }
      }
    },
    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['sass']
      }
    }
    // Use this Concat //
    // concat: {
    //   options: { separator: ';' },
    //   build: {
    //     src: ['js/file1.js', 'js/file2.js'],
    //     dest: 'js/app.js'
    //   }
    // }
    // concat: {
    //   options: {
    //     banner: '<%= banner %>',
    //     stripBanners: true
    //   },
    //   dist: {
    //     src: ['lib/<%= pkg.name %>.js'],
    //     dest: 'dist/<%= pkg.name %>.js'
    //   }
    // }
    // uglify: {
    //   dev: {
    //     options: {
    //       sourceMap: true,
    //       compress: false,
    //       mangle: false
    //     },
    //     files: {
    //       'public/js/bundle.min.js': ['public/js/client.js']
    //     }
    //   },
    //   dist: {
    //     options: {
    //       sourceMap: false
    //       // compress: true
    //       // mangle: true
    //     },
    //     files: {
    //       'public/js/bundle.min.js': ['public/js/client.js']
    //     }
    //   }
    // }
  });

  // These plugins provide necessary tasks.
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('dev', ['sass']);
  // grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
};

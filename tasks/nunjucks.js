/*
 * grunt-nunjucks
 * https://github.com/jlongster/nunjucks-grunt
 * https://github.com/asrashley/grunt-nunjucks
 *
 * Copyright (c) 2013 James Long
 * Copyright (c) 2015 Alex Ashley
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var nunjucks = require('nunjucks');
    var lib = require('nunjucks/src/lib');

    grunt.registerMultiTask('nunjucks', 'Precompile nunjucks', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var opts = this.options({
            asFunction: false,
            asDefine: false,
            env: null
        });

        var nameFunc = lib.isFunction(opts.name) ? opts.name : function(filepath) {
            return filepath;
        };

        this.files.forEach(function (f) {
            var src = f.src.filter(function (filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                var filename = filepath, js;
                if (f.baseDir) {
                    if (f.baseDir.substr(-1) !== '/') {
                        // Append a trailing slash, if there isn't one.
                        f.baseDir += '/';
                    }
                    if (filepath.substr(0, f.baseDir.length) === f.baseDir) {
                        // Strip leading `baseDir` from filename.
                        filename = filepath.substr(f.baseDir.length);
                    }
                }
                opts.name = nameFunc(filename);
                js =  nunjucks.precompile(filepath, opts);
                if(opts.asDefine){
                  js = 'define(["nunjucks"], function(nunjucks){'+js+
                      '  return {'+
                      '    render: function(ctx, cb) {'+
                      '      return nunjucks.render("'+opts.name+'", ctx, cb);'+
                      '    }'+
                      '  };'+
                      '});';
                }
                return js;
            }).join('');
            grunt.file.write(f.dest, src);
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });
};

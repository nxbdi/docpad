// Generated by CoffeeScript 1.3.1
(function() {
  var CSON, DocumentModel, FileModel, Model, balUtil, mime, pathUtil, yaml, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  pathUtil = require('path');

  balUtil = require('bal-util');

  _ = require('underscore');

  mime = require('mime');

  CSON = null;

  yaml = null;

  Model = require(__dirname + '/../base').Model;

  FileModel = require(__dirname + '/file');

  DocumentModel = (function(_super) {

    __extends(DocumentModel, _super);

    DocumentModel.name = 'DocumentModel';

    function DocumentModel() {
      return DocumentModel.__super__.constructor.apply(this, arguments);
    }

    DocumentModel.prototype.type = 'document';

    DocumentModel.prototype.meta = null;

    DocumentModel.prototype.defaults = {
      extensionRendered: null,
      filenameRendered: null,
      contentTypeRendered: null,
      header: null,
      parser: null,
      body: null,
      rendered: false,
      contentRendered: false,
      contentRenderedWithoutLayouts: null,
      dynamic: false,
      tags: null
    };

    DocumentModel.prototype.initialize = function(data, options) {
      var meta;
      this.layouts = options.layouts, meta = options.meta;
      this.meta = new Model();
      if (meta) {
        this.meta.set(meta);
      }
      return DocumentModel.__super__.initialize.apply(this, arguments);
    };

    DocumentModel.prototype.getMeta = function() {
      return this.meta;
    };

    DocumentModel.prototype.toJSON = function() {
      var data;
      data = DocumentModel.__super__.toJSON.apply(this, arguments);
      data.meta = this.getMeta().toJSON();
      return data;
    };

    DocumentModel.prototype.parseData = function(data, next) {
      var _this = this;
      this.layout = null;
      this.getMeta().clear();
      DocumentModel.__super__.parseData.call(this, data, function() {
        var a, b, body, c, content, err, fullPath, header, ignored, match, meta, metaDate, metaUrl, metaUrls, parser, seperator;
        content = _this.get('content');
        match = /^\s*([\-\#][\-\#][\-\#]+) ?(\w*)\s*/.exec(content);
        if (match) {
          seperator = match[1];
          a = match[0].length;
          b = content.indexOf("\n" + seperator, a) + 1;
          c = b + 3;
          fullPath = _this.get('fullPath');
          header = content.substring(a, b);
          body = content.substring(c);
          parser = match[2] || 'yaml';
          try {
            switch (parser) {
              case 'coffee':
              case 'cson':
                if (!CSON) {
                  CSON = require('cson');
                }
                meta = CSON.parseSync(header);
                _this.meta.set(meta);
                break;
              case 'yaml':
                if (!yaml) {
                  yaml = require('yaml');
                }
                meta = yaml["eval"](header);
                _this.meta.set(meta);
                break;
              default:
                err = new Error("Unknown meta parser: " + parser);
                return typeof next === "function" ? next(err) : void 0;
            }
          } catch (err) {
            return typeof next === "function" ? next(err) : void 0;
          }
        } else {
          body = content;
        }
        body = body.replace(/^\n+/, '');
        _this.set({
          header: header,
          body: body,
          parser: parser,
          content: body,
          name: _this.get('name') || _this.get('title') || _this.get('basename')
        });
        metaDate = _this.meta.get('date');
        if (metaDate) {
          metaDate = new Date(metaDate);
          _this.meta.set({
            date: metaDate
          });
        }
        ignored = _this.meta.get('ignored') || _this.meta.get('ignore') || _this.meta.get('skip') || _this.meta.get('draft') || (_this.meta.get('published') === false);
        if (ignored) {
          _this.meta.set({
            ignored: true
          });
        }
        metaUrls = _this.meta.get('urls');
        metaUrl = _this.meta.get('url');
        if (metaUrls) {
          _this.addUrl(metaUrls);
        }
        if (metaUrl) {
          _this.addUrl(metaUrl);
        }
        _this.set(_this.meta.toJSON());
        return typeof next === "function" ? next() : void 0;
      });
      return this;
    };

    DocumentModel.prototype.writeRendered = function(next) {
      var contentRendered, fileOutPath, logger;
      fileOutPath = this.get('outPath');
      contentRendered = this.get('contentRendered');
      logger = this.logger;
      logger.log('debug', "Writing the rendered file: " + fileOutPath);
      balUtil.writeFile(fileOutPath, contentRendered, function(err) {
        if (err) {
          return typeof next === "function" ? next(err) : void 0;
        }
        logger.log('debug', "Wrote the rendered file: " + fileOutPath);
        return typeof next === "function" ? next() : void 0;
      });
      return this;
    };

    DocumentModel.prototype.writeSource = function(next) {
      var body, content, fullPath, header, logger, parser, relativePath;
      logger = this.logger;
      if (!CSON) {
        CSON = require('cson');
      }
      fullPath = this.get('fullPath');
      relativePath = this.get('relativePath');
      content = this.get('content');
      body = this.get('body');
      parser = this.get('parser');
      logger.log('debug', "Writing the source file: " + relativePath);
      header = CSON.stringifySync(this.meta.toJSON());
      body = body.replace(/^\s+/, '');
      content = "### " + parser + "\n" + header + "\n###\n\n" + body;
      this.set({
        header: header,
        body: body,
        content: content
      });
      balUtil.writeFile(fileOutPath, content, function(err) {
        if (err) {
          return typeof next === "function" ? next(err) : void 0;
        }
        logger.log('info', "Wrote the source file: " + relativePath);
        return typeof next === "function" ? next() : void 0;
      });
      return this;
    };

    DocumentModel.prototype.normalize = function(next) {
      var _this = this;
      DocumentModel.__super__.normalize.call(this, function() {
        var extensionRendered, extensions;
        extensions = _this.get('extensions');
        extensionRendered = extensions.length ? extensions[0] : null;
        _this.set({
          extensionRendered: extensionRendered
        });
        return typeof next === "function" ? next() : void 0;
      });
      return this;
    };

    DocumentModel.prototype.contextualize = function(next) {
      var _this = this;
      DocumentModel.__super__.contextualize.call(this, function() {
        return _this.getEve(function(err, eve) {
          var basename, contentTypeRendered, extensionRendered, extensions, filenameRendered, fullPath, meta, name, outPath, relativeBase, slug, url;
          if (err) {
            return typeof next === "function" ? next(err) : void 0;
          }
          meta = _this.getMeta();
          fullPath = _this.get('fullPath');
          basename = _this.get('basename');
          relativeBase = _this.get('relativeBase');
          extensions = _this.get('extensions');
          extensionRendered = _this.get('extensionRendered');
          url = meta.get('url') || null;
          slug = meta.get('slug') || null;
          name = meta.get('name') || null;
          outPath = meta.get('outPath') || null;
          if (eve) {
            extensionRendered = eve.get('extensionRendered');
          }
          filenameRendered = extensionRendered ? "" + basename + "." + extensionRendered : "" + basename;
          url || (url = extensionRendered ? "/" + relativeBase + "." + extensionRendered : "/" + relativeBase);
          slug || (slug = _this.get('slug'));
          name || (name = filenameRendered);
          outPath || (outPath = _this.outDirPath ? pathUtil.join(_this.outDirPath, url) : null);
          _this.addUrl(url);
          _this.removeUrl(extensions.length ? "/" + relativeBase + "." + (extensions.join('.')) : "/" + relativeBase);
          contentTypeRendered = mime.lookup(outPath || fullPath);
          _this.set({
            extensionRendered: extensionRendered,
            filenameRendered: filenameRendered,
            url: url,
            slug: slug,
            name: name,
            outPath: outPath,
            contentTypeRendered: contentTypeRendered
          });
          return typeof next === "function" ? next() : void 0;
        });
      });
      return this;
    };

    DocumentModel.prototype.hasLayout = function() {
      return this.get('layout') != null;
    };

    DocumentModel.prototype.getLayout = function(next) {
      var err, file, layout, layoutId;
      file = this;
      layoutId = this.get('layout');
      if (!layoutId) {
        return typeof next === "function" ? next(null, null) : void 0;
      } else if (this.layout && layoutId === this.layout.id) {
        return typeof next === "function" ? next(null, this.layout) : void 0;
      } else {
        layout = this.layouts.findOne({
          id: {
            $startsWith: layoutId
          }
        });
        if (err) {
          return typeof next === "function" ? next(err) : void 0;
        } else if (!layout) {
          debugger;
          err = new Error("Could not find the specified layout: " + layoutId);
          return typeof next === "function" ? next(err) : void 0;
        } else {
          return typeof next === "function" ? next(null, layout) : void 0;
        }
      }
      return this;
    };

    DocumentModel.prototype.getEve = function(next) {
      if (this.hasLayout()) {
        this.getLayout(function(err, layout) {
          if (err) {
            return typeof next === "function" ? next(err, null) : void 0;
          } else {
            return layout.getEve(next);
          }
        });
      } else {
        if (typeof next === "function") {
          next(null, this);
        }
      }
      return this;
    };

    DocumentModel.prototype.render = function(templateData, next) {
      var body, extension, extensions, extensionsReversed, file, finish, logger, relativePath, renderDocument, renderExtensions, renderLayouts, renderPlugins, rendering, reset, _i, _len,
        _this = this;
      file = this;
      logger = this.logger;
      rendering = null;
      relativePath = this.get('relativePath');
      body = this.get('body');
      extensions = this.get('extensions');
      extensionsReversed = [];
      for (_i = 0, _len = extensions.length; _i < _len; _i++) {
        extension = extensions[_i];
        extensionsReversed.unshift(extension);
      }
      logger.log('debug', "Rendering the file: " + relativePath);
      reset = function() {
        file.set({
          rendered: false,
          contentRendered: body,
          contentRenderedWithoutLayouts: body
        });
        return rendering = body;
      };
      reset();
      finish = function(err) {
        file.set({
          contentRendered: rendering,
          rendered: true
        });
        if (err) {
          return next(err);
        }
        logger.log('debug', 'Rendering completed for:', file.get('relativePath'));
        return next(null, rendering);
      };
      renderPlugins = function(eventData, next) {
        return file.trigger(eventData.name, eventData, function(err) {
          if (err) {
            logger.log('warn', 'Something went wrong while rendering:', file.get('relativePath'));
            return next(err);
          }
          return next(err);
        });
      };
      renderLayouts = function(next) {
        file.set({
          contentRenderedWithoutLayouts: rendering
        });
        return file.getLayout(function(err, layout) {
          if (err) {
            return next(err);
          }
          if (layout) {
            templateData.content = rendering;
            return layout.render(templateData, function(err, result) {
              if (err) {
                return next(err);
              }
              rendering = result;
              return next();
            });
          } else {
            return next();
          }
        });
      };
      renderDocument = function(next) {
        var eventData;
        eventData = {
          name: 'renderDocument',
          extension: extensions[0],
          templateData: templateData,
          file: file,
          content: rendering
        };
        return renderPlugins(eventData, function(err) {
          if (err) {
            return next(err);
          }
          rendering = eventData.content;
          return next();
        });
      };
      renderExtensions = function(next) {
        var tasks;
        if (extensions.length <= 1) {
          return next();
        }
        tasks = new balUtil.Group(next);
        _.each(extensionsReversed.slice(1), function(extension, index) {
          return tasks.push(function(complete) {
            var eventData;
            eventData = {
              name: 'render',
              inExtension: extensionsReversed[index],
              outExtension: extension,
              templateData: templateData,
              file: file,
              content: rendering
            };
            return renderPlugins(eventData, function(err) {
              if (err) {
                return complete(err);
              }
              rendering = eventData.content;
              return complete();
            });
          });
        });
        return tasks.sync();
      };
      renderExtensions(function(err) {
        if (err) {
          return finish(err);
        }
        return renderDocument(function(err) {
          if (err) {
            return finish(err);
          }
          return renderLayouts(function(err) {
            return finish(err);
          });
        });
      });
      return this;
    };

    return DocumentModel;

  })(FileModel);

  module.exports = DocumentModel;

}).call(this);
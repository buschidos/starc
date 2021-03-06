var Morph = function(selector) {

    this.canvas = $(selector);
    this.paper  = new paper.PaperScope();
    this.state  = {
        visible: false,
        active: false,
        inProgress: false,
        standby: false,
        morph: 'circle', // 'circle', 'square', 'triangle' or 'smTriangle'
        prevMorph: null, // 'circle', 'square', 'triangle' or 'smTriangle'
        rectangle: 'initial', // 'initial', 'big', 'wide' or 'hidden'
        star: 'initial' // 'initial' or 'final'
    };
    this.sizes  = {
        circle    : 510,
        square    : 450,
        triangle  : 580,
        smTriangle: 290
    };
    // max of sizes
    this.morphSize = {
        x: 580,
        y: 580
    };
    this.dur = 800; // morph animation duration
    this.fadeDur = 200;
    this.shiftY = 680;
    this.visibleClass = 'is-visible';
    this.activeClass = 'is-active';
    this.standbyScale = 0.55;

    return this;
};

Morph.prototype._initContent = function() {
    var _         = this,
        state     = _.state;
        morphSize = _.morphSize;

    _.paper.setup(_.canvas[0]);

    _.backGroup  = new _.paper.Group();
    _.frontGroup = new _.paper.Group();
    _.starGroup  = new _.paper.Group();

    _.objects = {
        paths: {
            morph: new _.paper.Path.Circle({
                center: [_.paper.view.center.x, _.paper.view.center.y],
                radius: _.sizes.circle / 2
            }),
            star: new _.paper.Path.Star({
                center: _.paper.view.center,
                points: 5,
                radius1: 255,
                radius2: 255,
                fillColor: 'red'
            }),
            fill: new _.paper.Path.Rectangle({
                center: _.paper.view.center,
                size: [_.paper.view.viewSize.width, _.paper.view.viewSize.height],
                fillColor: {
                    gradient: {
                        stops: ['#2B92A5', '#CDF0E9']
                    },
                    origin: [_.paper.view.center.x, _.paper.view.center.y - _.sizes.circle / 2],
                    destination: [_.paper.view.center.x, _.paper.view.center.y + _.sizes.circle / 2]
                }
            }),
            fillStar: null // this will be a reference to a clone of _.objects.paths.fill
        },
        raster: {
            circle: {
                pic: new _.paper.Raster({
                    source: 'img/canvas1.png',
                    position: _.paper.view.center
                }),
                altPic: new _.paper.Raster({
                    source: 'img/canvas1.png',
                    position: _.paper.view.center,
                    opacity: 0
                }),
                position: {
                    x: _.paper.view.center.x + 111,
                    y: _.paper.view.center.y + 92
                }
            },
            square: {
                pic: new _.paper.Raster({
                    source: 'img/canvas2.png',
                    position: _.paper.view.center
                }),
                altPic: new _.paper.Raster({
                    source: 'img/canvas2.png',
                    position: _.paper.view.center,
                    opacity: 0
                }),
                position: {
                    x: _.paper.view.center.x + 29,
                    y: _.paper.view.center.y + 102
                }
            },
            triangle: {
                pic: new _.paper.Raster({
                    source: 'img/canvas3.png',
                    position: _.paper.view.center,
                    visible: true,
                }),
                altPic: new _.paper.Raster({
                    source: 'img/canvas3-1.png',
                    position: _.paper.view.center,
                    opacity: 0
                }),
                position: {
                    x: _.paper.view.center.x + 45,
                    y: _.paper.view.center.y + 90
                }
            }
        },
        other: {
            rectangle: new _.paper.Path.Rectangle({
                point: [0, 0],
                size: [513, 47],
                strokeWidth: 3,
                strokeColor: '#333',
            })
        }
    };

    //setup rectange
    _.objects.other.rectangle.bounds.center = new _.paper.Point(_.paper.view.center.x, _.paper.view.size.height - 64);

    // group objects
    _.backGroup.set({
        children: [
            _.objects.other.rectangle
        ]
    });

    _.frontGroup.set({
        children: [
            _.objects.paths.morph,
            _.objects.paths.fill,
        ],
        clipped: true
    });

    _.objects.paths.fillStar = _.objects.paths.fill.clone();
    _.starGroup.set({
        children: [
            _.objects.paths.star,
            _.objects.paths.fillStar
        ],
        clipped: true,
        visible: false
    });

    // set positioning of each raster and group them
    $.each(_.objects.raster, function(index, raster) {
        raster.pic.position.x = raster.position.x + morphSize.x;
        raster.pic.position.y = raster.position.y;
        raster.altPic.position.x = raster.position.x + morphSize.x / 2;
        raster.altPic.position.y = raster.position.y;

        _.frontGroup.addChild(raster.pic);
        _.backGroup.addChild(raster.altPic);
    });
};

Morph.prototype._initEvents = function() {
    var _ = this;

    _.paper.view.onFrame = function(event) {
        // TWEEN.update();
    };
};

Morph.prototype._render = function() {
    var _ = this;
    _.paper.view.draw();
};

Morph.prototype._calcPosition = function() {
    var _   = this,
        c   = _.sizes.circle,
        s   = _.sizes.square,
        t   = _.sizes.triangle,
        smt = _.sizes.smTriangle,
        point;

    // coordinates of vertexes for each morph state relative to view.center
    points = {
        circle: [
            {point: 0, x: -c/2, y:    0, handle: {x:    0, y:  140}},
            {point: 1, x:    0, y: -c/2, handle: {x: -140, y:    0}},
            {point: 2, x:  c/2, y:    0, handle: {x:    0, y: -140}},
            {point: 3, x:    0, y:  c/2, handle: {x:  140, y:    0}}
            // {x: -255, y:    0},
            // {x:    0, y: -255},
            // {x:  255, y:    0},
            // {x:    0, y:  255},
        ],
        square: [
            {point: 0, x: -s/2, y: -s/2, handle: {x: 0, y: 0}},
            {point: 1, x:  s/2, y: -s/2, handle: {x: 0, y: 0}},
            {point: 2, x:  s/2, y:  s/2, handle: {x: 0, y: 0}},
            {point: 3, x: -s/2, y:  s/2, handle: {x: 0, y: 0}}
            // {x: -225, y: -225},
            // {x:  225, y: -225},
            // {x:  225, y:  225},
            // {x: -225, y:  225},
        ],
        triangle: [
            {point: 0, x: -0.36207 * t/2, y: 0.58621 * t/2, handle: {x: 0, y: 0}},
            {point: 1, x:           -t/2, y: 0.39310 * t/2, handle: {x: 0, y: 0}},
            {point: 2, x:  0.53448 * t/2, y:          -t/2, handle: {x: 0, y: 0}},
            {point: 3, x:            t/2, y:           t/2, handle: {x: 0, y: 0}}
            // {x: -105, y:  170},
            // {x: -290, y:  114},
            // {x:  155, y: -290},
            // {x:  290, y:  290},
        ],
        smTriangle: [
            {point: 0, x: -0.36207 * smt/2, y: 0.58621 * smt/2, handle: {x: 0, y: 0}},
            {point: 1, x:           -smt/2, y: 0.39310 * smt/2, handle: {x: 0, y: 0}},
            {point: 2, x:  0.53448 * smt/2, y:          -smt/2, handle: {x: 0, y: 0}},
            {point: 3, x:            smt/2, y:           smt/2, handle: {x: 0, y: 0}},
        ]
    };

    _.pathPosition = {
        morph: {
            circle:     _._translateCoordinates(points.circle),
            square:     _._translateCoordinates(points.square),
            triangle:   _._translateCoordinates(points.triangle),
            smTriangle: _._translateCoordinates(points.smTriangle)
        },
        rectangle: {
            initial: {
                center: new _.paper.Point(_.paper.view.center.x, _.paper.view.size.height - 64),
                size: new _.paper.Size(513, 47)
            },
            big: {
                center: _.paper.view.center,
                size: new _.paper.Size(791, 261)
            },
            wide: {
                center: _.paper.view.center,
                size: new _.paper.Size(1221, 161)
            },
            hidden: {
                center: new _.paper.Point(_.paper.view.center.x, _.paper.view.size.height + 100),
                size: new _.paper.Size(513, 47)
            }
        }
    };
};

Morph.prototype._toggleContentVisibility = function(value, onlyPictures) {
    // show or hide content (pictures and rectangle)
    // value = true/false ==> content visible/invisible
    var _   = this,
        val = typeof value != 'undefined' ? value : !_.objects.raster.circle.pic.visible; // true or false

    $.each(_.objects.raster, function(index, item) {
        item.pic.visible    = val;
        item.altPic.visible = val;
    });

    if ( !onlyPictures ) {
        _.objects.other.rectangle.visible = val;
    }
};

Morph.prototype._changePicture = function(state, direction, duration) {
    var currentState = this._getState('morph');

    if ( state == currentState ) return;

    var _ = this,
        prevState = _._getState('prevMorph'),
        dur       = $.isNumeric(duration) ? duration / 1000 : _.dur / 1000,
        props,
        pics;

    /*### props item
    # inner/outer          - inside/outside morph path;
    # pic                  - paper raster object;
    # initPos              - position of pic before animation, relative to canvas center;
    # pos                  - position of pic/altPic after animation end, relative to canvas center;
    # opacity              - opacity for pic after animation end;
    # delay                - delay before start animation;
    ###*/
    props = {
        // current picture
        current : {
            inner: {
                pic: _.objects.raster[currentState].pic,
                initPos: _.objects.raster[currentState].position,
                pos: {
                    x: _.paper.view.center.x - _.morphSize.x,
                    y: _.objects.raster[currentState].position.y
                },
                duration: dur / 2,
                delay   : dur * 0.2, // ~ 150ms
                easing  : Power2.easeIn,
            },
            outer: {
                pic: _.objects.raster[currentState].altPic,
                initPos: _.objects.raster[currentState].position,
                pos: {
                    x: _.paper.view.center.x - _.morphSize.x / 2,
                    y: _.objects.raster[currentState].position.y
                },
                duration: dur / 2,
                delay   : 0,
                opacity : 0,
                easing  : Power1.easeIn
            }
        },
        // next picture
        next : {
            inner: {
                pic     : _.objects.raster[state].pic,
                initPos : { x: _.paper.view.center.x + _.morphSize.x,
                            y: _.objects.raster[state].position.y },
                pos     : _.objects.raster[state].position,
                duration: dur / 2,
                delay   : dur / 2,
                easing  : Power1.easeOut
            },
            outer: {
                pic     : _.objects.raster[state].altPic,
                initPos : { x: _.paper.view.center.x + _.morphSize.x / 2,
                            y: _.objects.raster[state].position.y },
                pos     : _.objects.raster[state].position,
                duration: dur / 2,
                delay   : dur / 2,
                opacity : 1,
                easing  : Power1.easeOut
            }
        }
    };

    pics = props;

    if ( direction == 'REVERSE' ) {
        pics.current.inner.pos.x  = _.paper.view.center.x + _.morphSize.x;
        pics.current.outer.pos.x  = _.paper.view.center.x + _.morphSize.x / 2;
        pics.next.inner.initPos.x = _.paper.view.center.x - _.morphSize.x;
        pics.next.outer.initPos.x = _.paper.view.center.x - _.morphSize.x / 2;
    }

    // reset properties after previous transformation in other methods
    pics.next.inner.pic.position.x = pics.next.inner.initPos.x;
    pics.next.inner.pic.position.y = pics.next.inner.initPos.y;
    pics.next.outer.pic.position.x = pics.next.outer.initPos.x;
    pics.next.outer.pic.position.y = pics.next.outer.initPos.y;
    pics.next.outer.pic.scaling.x = 1;
    pics.next.outer.pic.scaling.y = 1;

    $.each(pics, function(index, item) {
        TweenMax.to(item.inner.pic.position, item.inner.duration, {
            x: item.inner.pos.x,
            ease: item.inner.easing,
            delay: item.inner.delay
        });

        TweenMax.to(item.outer.pic.position, item.outer.duration, {
            x: item.outer.pos.x,
            ease: item.outer.easing,
            delay: item.outer.delay
        });

        TweenMax.to(item.outer.pic, item.outer.duration, {
            opacity: item.outer.opacity,
            ease: item.outer.easing,
            delay: item.outer.delay
        });
    });
};

Morph.prototype._togglePicture = function(state, duration) {
    // if state was not passed, then this method hiddes picture for active morph state,
    // otherwise he show picture for passed state
    var _            = this,
        currentState = _._getState('morph'),
        dur          = $.isNumeric(duration) ? duration / 1000 : _.dur / 1000,
        easing       = Linear.easeNone,
        pics;

    if ( typeof state == 'undefined' || state === null ) {

        state = currentState;
        pics = {
            inner: {
                pic: _.objects.raster[state].pic,
                pos: {
                    x: _.objects.raster[state].position.x,
                    y: _.paper.view.center.y + _.morphSize.y / 3 * 2,
                },
                initPos: _.objects.raster[state].position
            },
            outer: {
                pic: _.objects.raster[state].altPic,
                pos: _.objects.raster[state].position,
                initPos: _.objects.raster[state].position,
                initOpacity: 1,
                initScaling: {x: 1, y: 1},
                opacity: 0,
                scaling: {x: 0.2, y: 0.2},
                // delay: 100,
                delay: 0.1
            }
        };

        // console.log('%c' + 'Hide picture:' + ' => ' + state, 'background:lightblue');

    } else {

        pics = {
            inner: {
                pic: _.objects.raster[state].pic,
                initPos: {
                    x: _.objects.raster[state].position.x,
                    y: _.paper.view.center.y + _.morphSize.y / 3 * 2,
                },
                pos: _.objects.raster[state].position
            },
            outer: {
                pic: _.objects.raster[state].altPic,
                initPos: _.objects.raster[state].position,
                pos: _.objects.raster[state].position,
                initOpacity: 0,
                initScaling: {x: 0.2, y: 0.2},
                opacity: 1,
                scaling: {x: 1, y: 1},
                // delay: 100,
                delay: 0.1
            }
        };

        // console.log('%c' + 'Show picture:' + ' => ' + state, 'background:lightblue');

    }

    // setup pictures initial state
    pics.inner.pic.position.x = pics.inner.initPos.x;
    pics.inner.pic.position.y = pics.inner.initPos.y;
    pics.outer.pic.position.x = pics.outer.initPos.x;
    pics.outer.pic.position.y = pics.outer.initPos.y;
    pics.outer.pic.opacity    = pics.outer.initOpacity;
    pics.outer.pic.scale(pics.outer.initScaling.x, _.objects.paths.morph.bounds.topCenter);

    // translate picture inside morph object
    TweenMax.to(pics.inner.pic.position, dur, {
        x: pics.inner.pos.x,
        y: pics.inner.pos.y,
        ease: easing
    });

    // scale picture outside morph object
    TweenMax.to(pics.outer.pic.scaling, dur, {
        x: pics.outer.scaling.x,
        y: pics.outer.scaling.y,
        ease: easing
    });

    // fade in picture outside morph object
    TweenMax.to(pics.outer.pic, dur, {
        opacity: pics.outer.opacity,
        ease: easing,
        delay: pics.outer.delay
    });

    // translate picture outside morph object
    TweenMax.to(pics.outer.pic.position, dur, {
        x: pics.outer.pos.x,
        y: pics.outer.pos.y,
        ease: easing
    });
};

Morph.prototype._morph = function(state, dur) {

    var currentState  = this._getState('morph');

    if ( state == currentState ) return;

    var _          = this,
        duration   = $.isNumeric(dur) ? dur / 1000 : _.dur / 1000,
        easing     = Sine.easeOut,
        morphPath  = _.objects.paths.morph,
        segments   = morphPath.segments,
        prevPoints = _.pathPosition.morph[currentState],
        points     = _.pathPosition.morph[state];

    _._updateState('inProgress', true);

    $.each(segments, function(index, segment) {
        TweenMax.to(segment.point, duration, {
            x: points[index].x,
            y: points[index].y,
            ease: easing
        });

        if ( currentState == 'circle' || state == 'circle' ) {

            TweenMax.to(segment.handleIn, duration, {
                x: points[index].handle.x,
                y: points[index].handle.y,
                ease: easing,
            });

            TweenMax.to(segment.handleOut, duration, {
                x: - points[index].handle.x,
                y: - points[index].handle.y,
                ease: easing,
            });
        }
    });

    _._updateState('prevMorph', currentState);
    _._updateState('morph', state);

    setTimeout(function() {
        _._updateState('inProgress', false);
    }, duration);

    // console.log('%c' + 'State change: ' + currentState + ' => ' + state, 'background:yellow');
};

Morph.prototype._morphRectangle = function(state, duration, delay) {
    var prevState = this._getState('rectangle');

    if ( state == prevState ) return;

    var _       = this,
        rect    = _.objects.other.rectangle,
        prevPos = _.pathPosition.rectangle[prevState],
        pos     = _.pathPosition.rectangle[state],
        easing  = Power2.easeOut,
        dur     = $.isNumeric(duration) ? duration / 1000 : _.dur / 1000,
        del     = $.isNumeric(delay) ? delay / 1000 : 0;

    // change rectange size
    TweenMax.fromTo(rect.bounds.size, dur, {
        width: prevPos.size.width,
        height: prevPos.size.height,
    },{
        width: pos.size.width,
        height: pos.size.height,
        ease: easing,
        delay: del
    });

    // change rectange position
    TweenMax.fromTo(rect.position, dur, {
        x: prevPos.center.x,
        y: prevPos.center.y
    },{
        x: pos.center.x,
        y: pos.center.y,
        ease: easing,
        delay: del
    });

    _._updateState('rectangle', state);
};

Morph.prototype._updateState = function(name, state) {
    this.state[name] = state;
};

Morph.prototype._getState = function(name) {
    if ( name && this.state.hasOwnProperty(name) ) {
        return this.state[name];
    } else {
        return this.state;
    }
};

Morph.prototype._translateCoordinates = function(pointsArray) {
    var _   = this,
        arr = pointsArray;
    $.each(arr, function(index, value) {
        value.x += _.paper.view.center.x;
        value.y += _.paper.view.center.y;
    });
    return arr;
};

Morph.prototype._fade = function(duration) {
    var _       = this,
        visible = _._getState('visible'),
        tl      = new TimelineLite();
        dur     = $.isNumeric(duration) ? duration / 1000 : _.fadeDur / 1000;

    tl
        .addLabel('beginFade')
        .to(_.canvas, dur, {autoAlpha: visible ? 0 : 1, ease: Linear.easeNone})
        .addLabel('endFade')
        .add(function() {
            _.canvas.toggleClass(_.visibleClass);
            }, visible ? 'endFade' : 'beginFade')
        .add(function() {
            _._updateState('visible', !visible);
            });
};

Morph.prototype.init = function() {
    this._initContent();
    this._initEvents();
    this._toggleContentVisibility(false, false); //make pictures invisible
    this._calcPosition();
    this._initStar();
    this._render();
    return this;
};

Morph.prototype.changeState = function(state, direction, duration) {
    this._changePicture(state, direction, duration);
    this._morph(state, duration);
};

Morph.prototype.activate = function(state, delay) {
    var active = this._getState('active');

    if ( active ) return;

    var _       = this,
        timeout = delay || _.fadeDur; // delay in milliseconds between visible state and activating

    // _._fade();

    setTimeout(function() {
        _._toggleContentVisibility(true, true); // make pictures visible
        _._togglePicture(state);
        _._morph(state);
        _._morphRectangle('big');
        _._updateState('active', true);
    }, timeout);
};

Morph.prototype.deactivate = function() {
    var active = this._getState('active');

    if ( !active ) return;

    var _ = this;

    _._togglePicture();
    _._morph('circle');
    _._morphRectangle('initial');

    setTimeout(function() {
        // _._fade();
        _._toggleContentVisibility(false, true); // make pictures invisible
    }, _.dur);

    _._updateState('active', false);
};

Morph.prototype.moveDown = function(duration) {
    if ( this._getState('active') ) return;
    var _   = this,
        tl  = new TimelineLite(),
        dur = duration || _.dur; // seconds

    tl
        .addLabel('fadeIn', _.fadeDur / 1000)
        .add(function() {
            _._fade();
            _._toggleContentVisibility(false);
            _.toggleMorphToStar();
        })
        .add(function() {
            // _._morph('smTriangle', dur);
            _.morphStar('final', dur);
            }, 'fadeIn')
        .to(_.canvas, dur / 1000, {y: _.shiftY}, 'fadeIn');
};

Morph.prototype.moveBack = function(duration) {
    if ( this._getState('active') ) return;
    var _   = this,
        tl  = new TimelineLite(),
        dur = duration || _.dur; // seconds

    tl
        .add(function() {
            // _._morph('circle', dur);
            _.morphStar('initial', dur);
            })
        .to(_.canvas, dur / 1000, {y: 0})
        .add(function() {
            _._fade();
            })
        .add(function() {
            _._toggleContentVisibility(true);
            _.toggleMorphToStar();
            }, '+=0.2');
};

Morph.prototype.initStandby = function(state) {
    var _          = this,
        prevObj    = _.objects.raster[_.state.morph],
        obj        = _.objects.raster[state],
        prevPic    = prevObj.pic,
        prevAltPic = prevObj.altPic,
        pic        = obj.pic,
        altPic     = obj.altPic;


    _._toggleContentVisibility(true, true);
    if ( !_.state.visible ) _._fade(0);

    prevPic.position.x = prevAltPic.position.x = 3000;

    pic.position.x = altPic.position.x = obj.position.x;
    pic.position.y = altPic.position.y = obj.position.y;

    _._morph(state, 0);
    setTimeout(function() { _.toStandby(0); }, 0);
};

Morph.prototype.toStandby = function(animDur, cb) {
    if ( this.state.inProgress ) return;

    var _          = this,
        morph      = _.objects.paths.morph,
        image      = _.objects.raster[_.state.morph].altPic,
        frontGroup = _.frontGroup,
        dur        = $.isNumeric(animDur) ? animDur / 1000 : _.dur / 1000,
        ease1      = Back.easeOut.config(1),
        ease2      = Power1.easeIn,
        tl         = new TimelineLite();

    _._updateState('inProgress', true);

    tl
        .add(function() {
            _._morphRectangle('wide', animDur);
            }, '+=0.2')
        .to(morph.scaling, dur,   {x: _.standbyScale, y: _.standbyScale, ease: ease1, delay: dur/2}, 0)
        .to(image.scaling, dur/2, {x: 0.3, y: 0.3,   ease: ease2}, 0)
        .to(image,         dur/2, {opacity: 0,       ease: ease2}, 0)
        .to(frontGroup,    dur/2, {opacity: 0,       ease: ease2})
        .add(function() {
            _._updateState('standby', false);
            _._updateState('inProgress', false);
            if ( typeof cb == 'function' ) cb();
            });
};

Morph.prototype.fromStandby = function(animDur, cb) {
    if ( this.state.inProgress ) return;

    var _          = this,
        morph      = _.objects.paths.morph,
        image      = _.objects.raster[_.state.morph].altPic,
        frontGroup = _.frontGroup,
        dur        = $.isNumeric(animDur) ? animDur / 1000 : _.dur / 1000,
        ease1      = Back.easeIn.config(1.4),
        ease2      = Power1.easeOut,
        tl         = new TimelineLite();

    _._updateState('inProgress', true);

    tl
        .add(function() {
            _._morphRectangle('big', animDur);
            }, '+=0.2')
        .to(frontGroup,    0,     {opacity: 1, ease: ease2}, 0)
        .to(morph.scaling, dur,   {x: 1, y: 1, ease: ease1}, 0)
        .to(image.scaling, dur/2, {x: 1, y: 1, ease: ease2, delay: dur}, 0)
        .to(image,         dur/2, {opacity: 1, ease: ease2, delay: dur}, 0)
        .add(function() {
            _._updateState('standby', true);
            _._updateState('inProgress', false);
            if ( typeof cb == 'function' ) cb();
            });
};

Morph.prototype.fadeFrontGroup = function(opacity, fadeDur) {
    var _   = this,
        dur = $.isNumeric(fadeDur) ? fadeDur / 1000 : _.fadeDur / 1000,
        value = $.isNumeric(opacity) ? opacity : 1;

    TweenMax.to(_.frontGroup, dur, {opacity: value, ease: Linear.easeNone});
};

Morph.prototype._initStar = function() {
    var _             = this;
    var initialValues = [];
    var finalValues   = [];
    var initStar      = _.objects.paths.star;
    var targetStar    = new _.paper.Path.Star({
        center: _.paper.view.center,
        points: 5,
        radius1: 72,
        radius2: 190,
    });

    targetStar.rotate(25);
    initStar.smooth();

    function buildArray(starObj, arr) {
        $.each(starObj.segments, function(index, segment) {
            arr.push({
                point: index,
                x: segment.point.x,
                y: segment.point.y,
                handleIn: {
                    x: segment.handleIn.x,
                    y: segment.handleIn.y
                },
                handleOut: {
                    x: segment.handleOut.x,
                    y: segment.handleOut.y
                }
            });
        });
    }

    buildArray(initStar, initialValues);
    buildArray(targetStar, finalValues);

    _.pathPosition.star = {
        initial: initialValues,
        final: finalValues
    };

    targetStar.remove();
};

Morph.prototype.morphStar = function(state, dur) {
    var _            = this;
    var currentState = _._getState('star');
    var duration     = $.isNumeric(dur) ? dur / 1000 : _.dur / 1000;
    var easing       = Sine.easeOut;
    var prevPoints   = _.pathPosition.star[currentState];
    var points       = _.pathPosition.star[state];

    if (currentState == state) return;

    $.each(_.objects.paths.star.segments, function(index, segment) {
        TweenMax.to(segment.point, duration, {
            x: points[index].x,
            y: points[index].y,
            ease: easing
        });
        TweenMax.to(segment.handleIn, duration, {
            x: points[index].handleIn.x,
            y: points[index].handleIn.y,
            ease: easing
        });
        TweenMax.to(segment.handleOut, duration, {
            x: points[index].handleOut.x,
            y: points[index].handleOut.y,
            ease: easing
        });
    });

    _._updateState('star', state);
};

Morph.prototype.toggleMorphToStar = function() {
    var _ = this;
    _.frontGroup.visible = !_.frontGroup.visible;
    _.starGroup.visible  = !_.starGroup.visible;
};

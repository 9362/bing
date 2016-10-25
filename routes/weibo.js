var router = require('express').Router(),
    passport = require('passport'),
    WeiboStrategy = require('passport-weibo').Strategy,
    request = require('superagent'),
    weibo = require('../configs/config').weibo,
    weiboUtils = require('../utils/weiboUtils');
// passport 组件所需要实现的接口
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    //console.log(done);
    done(null, obj);
});
// passport 的 WeiboStrategy 所必须设置的参数
passport.use(new WeiboStrategy({
    clientID: weibo.CLIENT_ID,
    clientSecret: weibo.CLIENT_SECRET,
    forcelogin: true,
    callbackURL: 'http://127.0.0.1:3000/weibo/callback'
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        // 此处在服务端存储 ACCESSTOKEN 是为了后续发送微博所需要的必要参数
        weibo.USER_UID = profile.id;
        profile.id === weibo.MASTER_UID ? weibo.MASTER_ACCESS_TOKEN = accessToken : '';
        weibo.ACCESS_TOKEN = accessToken;
        return done(null, profile);
    });
}));
router.get('/', passport.authenticate('weibo'), function(req, res) {});
router.get('/callback', passport.authenticate('weibo', {
    failureRedirect: '/'
}), function(req, res, next) {
    req.session.weibo = weibo;
    res.redirect('/');
});
router.get('/send', function(req, res, next) {
    if (weibo.ACCESS_TOKEN === '') {
        res.redirect('/weibo');
    }
    weiboUtils.update(req, res, next, weibo);
});
router.get('/login', function(req, res) {
    weiboUtils.login();
});
router.get('/shorten', function(req, res, next) {
    weiboUtils.shorten('http://bing.ioliu.cn', function(data) {
        res.send(data);
    });
});
module.exports = router;
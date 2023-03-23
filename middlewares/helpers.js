function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return res.redirect('/dashboard');
    next();
}
function removeSlash(inputString) {
    return inputString.replace(/\//g, '');
}
module.exports = {
    checkAuthenticated: checkAuthenticated,
    checkNotAuthenticated: checkNotAuthenticated,
    removeSlash: removeSlash
};

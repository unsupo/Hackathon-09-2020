const Fuse = require("fuse.js");

const get_fuse_options = (keys) => {
    return {
        // https://fusejs.io/api/options.html
        // isCaseSensitive: false,
        includeScore: true,
        // shouldSort: true,
        includeMatches: true,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        // threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        keys: keys
    }
}

module.exports.search = (data, keys, value) => {
    return new Fuse(data, get_fuse_options(keys)).search(value)
}
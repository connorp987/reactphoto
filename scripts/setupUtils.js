const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Orientation } = require('../src/constants/Image');
const { PageType } = require('../src/constants/Page');

const ImageFormats = {
    '.jpg': 'Jpeg',
    '.jpeg': 'Jpeg',
    '.png': 'Png',
    '.gif': 'Gif',
};

const TextFormats = {
    '.txt': 'Text',
    '.md': 'Markdown',
    '.html': 'Html',
};

const getFileType = extension => {
    return ImageFormats[extension] 
        ? PageType.Image
        : TextFormats[extension]
            ? PageType.Text
            : null;
};

const parseFileInfo = (filePath, srcDir = '') => {
    const re = RegExp(`\\${path.sep}`, 'g');
    const data = path.parse(filePath);
    const stat = fs.statSync(filePath);

    const isDirectory = stat.isDirectory();
    const fileType = isDirectory ? PageType.Folder : getFileType(data.ext);

    return {
        originalPath: filePath,
        name: data.name,
        type: fileType,
        src: (
            filePath
                .replace(srcDir, '')
                .replace(re, '/')
        ),
        slug: (
            filePath
                .replace(srcDir, '')
                .replace(data.ext, '')
                .replace(re, '/')
        ),
    };
};

const getOrientation = (w, h) => {
    if(w > h) {
        return Orientation.Landscape;
    } if(h > w) {
        return Orientation.Portrait;
    } if(w === h) {
        return Orientation.Square;
    } else {
        return Orientation.Unknown;
    }
};

const getSharpMeta = async img => {
    const image = sharp(img);
    const meta = await image.metadata();
    return {
        format: meta.format,
        width: meta.width,
        height: meta.height,
        orientation: getOrientation(meta.width, meta.height)
    };
};

const getThumbnail = async (img) => {
    // TODO: generate thumbnail
    return 'https://via.placeholder.com/400x400';
};

const scanDirectory = function(dir, processFile) {
    return fs.promises
        .readdir(dir)
        .then(files => files.map(file => path.resolve(dir, file)))
        .then(files => files.reduce((agg, file) => {
            const data = processFile(file);
            return data ? [ ...agg, data ] : agg;
        }, []))
        .then(promises => Promise.all(promises));
};

module.exports = {
    getOrientation,
    getSharpMeta,
    scanDirectory,
    parseFileInfo,
    getThumbnail,
};

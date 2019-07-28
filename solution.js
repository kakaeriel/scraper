const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = require('fs');

const config = require('./config');
const {scrapePage, scrapePromotion, scrapePromotionDetail} = require('./service');

const parseCategories = (html) => {
    let categories = [];
    const $ = cheerio.load(html);
    const htmlCategories = $.html('#subcatpromo div');
    $(htmlCategories).map((index, data) => {
        categories.push(data.firstChild.attribs.title)
    });

    return categories;
};

const parsePromotion = (html) => {
    const ids = [];
    const $ = cheerio.load(html);
    const htmlPromotions = $.html('#promolain li a');
    $(htmlPromotions).map((index, data) => {
        const href = data.attribs.href.split("=");
        const id = href[href.length - 1];
        ids.push(id);
    });

    return ids;
};

const parsePagination = (html) => {
    let pages = [];
    const $ = cheerio.load(html);
    const htmlPromotions = $.html('.tablepaging td a');
    $(htmlPromotions).map((index, data) => {
        if (data.attribs.id !== undefined) {
            pages.push(parseInt(data.attribs.page));
        }
    });

    return pages;
};

const parsePromotionDetail = (html) => {
    const $ = cheerio.load(html);
    const imageAttr = $('.keteranganinside img').attr();
    const imageUrl = (imageAttr === undefined) ? null : imageAttr.src;

    return new Object({
        title: $('.titleinside h3').text(),
        area: $('.area b').text(),
        periode: $('.periode b').text(),
        image: config.baseUrl + imageUrl,
    })
};

const getCategories = async () => {
    let results = [];
    const html = await scrapePage();
    const categories = await parseCategories(html);

    await categories.map((category) => {
        results.push(category);
    });

    return results;
};

const getPromotionDetail = async (promotionIds) => {
    let results = [];
    await Promise.all(promotionIds.map(async (promotionId) => {
        const html = await scrapePromotionDetail(promotionId);
        const promotion = await parsePromotionDetail(html);

        if (promotion.title !== '') {
            results.push(promotion);
        }
    }));

    return results
};

const getPages = async (subCategoryId) => {
    const html = await scrapePromotion(subCategoryId);
    return await parsePagination(html);
};

const getPromotions = async () => {
    let promotions = {};
    const categories = await getCategories();

    await Promise.all(Promise.each(categories, async (category, index) => {
        console.log('Starting get data category '+ category);
        const subCategoryId = index + 1;
        const pages = await getPages(subCategoryId);

        let dataCategories = [];

        for (let i = 1; i <= pages.length; i++) {
            console.log('Page: '+ i);
            const html = await scrapePromotion(subCategoryId, i);
            let ids = await parsePromotion(html);

            const promotionDetails = await getPromotionDetail(ids);

            dataCategories = dataCategories.concat(promotionDetails);
        }

        promotions[category] = dataCategories;
        console.log('Finished get data category '+ category);
        console.log('==== Separated ===');
    }));

    return promotions
};

const solution = async (success, error) => {
    try {
        const data = await getPromotions();
        fs.writeFile('solution.json', JSON.stringify(data), err => {
            if (err) {
                error(err)
            }

            success('Completed')
        });
    } catch (e) {
        throw e
    }
};

solution(
    (response) => {
        console.log(response)
    },
    err => {
        console.log(err)
    }
);

const axios = require('axios');
const config = require('./config');

const scrapePage = () => {
    return axios.get(config.urlPromo)
        .then(response => {
            if (response.status === 200) {
                return response.data
            }
        })
        .catch(error => {
            console.log(error);
            return false;
        });
};

const scrapePromotion = (subCategory, page) => {
    page = (typeof page === 'number') ? page : 1;
    subCategory = (typeof page === 'number') ? subCategory : 1;

    return axios.get(config.urlPromoAjax, {
        params: {
            page,
            subcat: subCategory
        }
    })
        .then(response => {
            if (response.status === 200) {
                return response.data
            }
            return false
        })
        .catch(error => {
            console.log(error);
            return false;
        });
};

const scrapePromotionDetail = (id) => {
    if (id === undefined && id === null) {
        console.log("ID is undefined or null");
        return false;
    }
    return axios.get(config.urlPromoDetail, {
        params: {id}
    }).then(response => {
        if (response.status === 200) {
            return response.data
        }
    }).catch(error => {
        console.log(error);
        return false;
    });
};

module.exports = {
    scrapePage: scrapePage,
    scrapePromotion: scrapePromotion,
    scrapePromotionDetail: scrapePromotionDetail
};

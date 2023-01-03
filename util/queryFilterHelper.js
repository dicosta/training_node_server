const buildFilterWhereClause = (queryObject) => {
    var where_clause = ''

    if (queryObject['filter_title']) {
        where_clause  = where_clause + ` AND title like '%' || @filter_title || '%' `
    }

    if (queryObject['filter_description']) {
        where_clause  = where_clause + ` AND description like '%' || @filter_description || '%' `
    }
 
    if (queryObject['filter_price_cents_from'] && queryObject['filter_price_cents_to']) {
        where_clause  = where_clause + ` AND price_cents >= @filter_price_cents_from AND price_cents <= @filter_price_cents_to `
    } else if (queryObject['filter_price_cents_from']) {
        where_clause  = where_clause + ` AND price_cents >= @filter_price_cents_from `
    } else if (queryObject['filter_price_cents_to']) {
        where_clause  = where_clause + ` AND price_cents <= @filter_price_cents_to `
    }

    if (queryObject['filter_available_from'] && queryObject['filter_available_to']) {
        where_clause  = where_clause + ` AND available_since <= @filter_available_from AND available_to >= @filter_available_to `
    } else if (queryObject['filter_available_from']) {
        where_clause  = where_clause + ` AND available_since <= @filter_available_from `
    } else if (queryObject['filter_available_to']) {
        where_clause  = where_clause + ` AND available_to >= @filter_available_to `
    }

    return where_clause
};

module.exports = {buildFilterWhereClause};
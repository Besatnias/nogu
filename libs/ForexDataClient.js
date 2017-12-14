const WebRequest = require('web-request');

class ForexDataClient
{
    constructor(api_key) {
        this.api_key = api_key;
        this.base_uri = 'https://forex.1forge.com/1.0.2/';
    }

    fetch(api_call)
    {
        return WebRequest.json(this.base_uri + api_call + '&api_key=' + this.api_key);
    }

    getQuotes(pairs)
    {
        return this.fetch('quotes?cache=false&pairs=' + pairs.toString());
    }

    getSymbols()
    {
        return this.fetch('symbols?cache=false');
    }

    convert(from, to, quantity)
    {
        return this.fetch('convert?cache=false&from=' + from + '&to=' + to + '&quantity=' + quantity);
    }

    marketStatus()
    {
        return this.fetch('market_status?cache=false');
    }

    quota()
    {
        return this.fetch('quota?cache=false');
    }
}

module.exports = ForexDataClient;
const request = require('./request')
const cheerio = require("cheerio");
const express = require('express');
const app = express();

const pData = "https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%EB%82%A0%EC%94%A8";

async function weather(city) {
    let $ = cheerio.load((await request((typeof city == "undefined")?pData:pData+encodeURI(city))).body);
    let data = $('div[class=weather_box]');
    let dust = [];

    data.find('dl[class=indicator]').find('dd').each(function() {
        if($(this).find('dd > span[class=num]').text() != "") {
            dust.push($(this).find('dd > span[class=num]').text());
        }
    });

    let information = {
        "information": "success",
        "area": data.find('span[class=btn_select]').find('em').text(),
        "temp": data.find('p[class=info_temperature]').find('span[class=todaytemp]').html(),
        "dust": dust.shift(),
        "udust": dust.shift(),
        "ozone": dust.shift(),
        "ment" : data.find('div[class=main_info]').find('p[class=cast_txt]').text(),
        "rainfall" : data.find('span[class=rainfall] > em > span[class=num]').text() + "mm"
    };

    if(information.rainfall == 'mm') {
        information.rainfall = '0mm';
    }

    if(data.html() == null) {
        information = {status: "no information"};
    }

    return information;
}

app.get('/', async (req,res)=>{
    res.send((await weather()));
});
app.get('/:city', async (req,res)=>{
    res.send((await weather(req.params.city)));
});

app.listen(80);

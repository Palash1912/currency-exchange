const express=require("express");
const bodyParser=require("body-parser");
const https=require("https");
const ejs=require("ejs");

const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// global variables
let baseCurr="USD";
let resCurr="INR";
let exchangeValue=0;

// home route
app.get("/", function(req,res){
    res.render("home");
})

app.post("/", function(req,res){
    // console.log(req.body)

    baseCurr=req.body.fromCurrency;
    resCurr=req.body.toCurrency;

    // api call
    const url = "https://api.exchangerate.host/latest?base=" + baseCurr + "&symbols=" + resCurr;

    https.get(url, function(response) {
    let currencyData = '';

    response.on('data', function(chunk) {
        currencyData += chunk;
    });

    response.on('end', function() {
        const parsedData = JSON.parse(currencyData);
        // updating exchangeRate
        exchangeValue = (parsedData.rates[resCurr]).toFixed(2);
        // console.log(exchangeValue);

        //creating new object
        const forexExchange = {
            baseCurrency: baseCurr,
            exchangeCurrency: resCurr,
            rate: exchangeValue
        };
        console.log(forexExchange);

        res.redirect("/success")
    });
    }).on('error', function(err) {
        console.log(err);
    });

})

// success ejs (redirected after home page)
app.get("/success", function(req,res){
    res.render("success",{amountEJS: 1,PrimaryCurrency: baseCurr, result: exchangeValue, SecondaryCurrency: resCurr });
})

// Global Variables for convert
let baseCurr2="";
let resCurr2="";
let exchangeValue2=0;
let exchangeAmount=0;
let currentExchangeRate=0;

// successConvert ejs (redirected after successfull conversion)
app.get("/successConvert", function(req,res){
    res.render("successConvert",{amountEJS:exchangeAmount, PrimaryCurrency:baseCurr2, result:exchangeValue2, SecondaryCurrency:resCurr2, 
        exchangeRateEJS: currentExchangeRate})
})

// about route
app.get("/about", function(req,res){
    res.render("about");
})

// contact us route
app.get("/contact", function(req,res){
    res.render("contact");
})

// convert ropute
app.get("/convert", function(req,res){
    res.render("convert");
})

app.post("/convert", function(req,res){

    console.log(req.body);
    baseCurr2=req.body.fromCurrency;
    resCurr2=req.body.toCurrency;
    exchangeAmount=req.body.amount;

    // api call
    const url = "https://api.exchangerate.host/convert?from=" + baseCurr2 + "&to=" + resCurr2 + "&amount="+ exchangeAmount + "&places=" +2;

    https.get(url, function(response) {
    let currencyData = '';

    response.on('data', function(chunk) {
        currencyData += chunk;
    });

    response.on('end', function() {
        const parsedData = JSON.parse(currencyData);
        // console.log(parsedData);
        // updating exchangeRate
        exchangeValue2 = (parsedData.result);
        currentExchangeRate=parsedData.info.rate;

        //creating new object
        const forexExchange = {
            baseCurrency: baseCurr2,
            exchangeCurrency: resCurr2,
            amount: exchangeAmount,
            exchangeOutput: exchangeValue2,
            forexExchangeRate:currentExchangeRate
        };
        console.log(forexExchange);

        res.redirect("/successConvert")
    });
    }).on('error', function(err) {
        console.log(err);
    });
})

// port 3000
app.listen(process.env.PORT || 3000, function(){
    console.log("server up and running");
})
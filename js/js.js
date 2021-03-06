$( document ).ready(function(){
    //Order
    //Resize item buttons on load
    $(".item-btns-container").css("grid-auto-rows", $('.item-btn').width());

    //Load current order
    $("#current-order-items").load("../views/current-order-item-view.php");

    //Load current order total
    $("#total-val").load("controllers/total.php");

    //Check status of previous order
    orderStatus();

    //Load pending orders
    loadPendingOrders();

})

//Menu
$("#menu-btn").click(function(){
    $("#menu").animate({width:'toggle'},350);
    console.log("click");
})

//Login
$(".user").click(function(){
    $(".user").removeClass("active");
    $(this).addClass("active");

    $("#password-container").show();

    $userId = $(this).attr("data-user-id");
    $("#user-id").val($userId);

    $("#password-error").remove();
})

//Check last order status
function orderStatus(){
    $orderStatus = $("#order-check").attr("data-status");
    if($("#order-check").attr("data-status")==="Processing"){
        showCurrentOrder();
    }else{
        newOrder();
    }
}

//Show new order
function newOrder(){
    hideOptions();
    $("#new-order").fadeIn(200);
    $("#current-order-info").empty();
}

//Hide new order
function showCurrentOrder(){
    $("#new-order").fadeOut(200);

    setTimeout(function(){
        $("#current-order-info").load("views/current-order-info-view.php");
    } , 1000);
    setTimeout(function(){
        $("#current-order-items").load("views/current-order-item-view.php");
    } , 1200);
}

//Resize item buttons on resize
$( window ).resize(function(){
    $(".item-btns-container").css("grid-auto-rows", $('.item-btn').width());
})

//Show menu items for each category
$(".sort-btn").click(function(){
    $btnID = $(this).attr("id");
    if($btnID==="hot-drinks-btn"){
        $("#hot-drinks").show();
        $("#cold-drinks").hide();
        $("#food").hide();
        $("#snacks").hide();
    }else if($btnID==="cold-drinks-btn"){
        $("#hot-drinks").hide();
        $("#cold-drinks").show();
        $("#food").hide();
        $("#snacks").hide();
    }else if($btnID==="food-btn"){
        $("#hot-drinks").hide();
        $("#cold-drinks").hide();
        $("#food").show();
        $("#snacks").hide();
    }else if($btnID==="snacks-btn"){
        $("#hot-drinks").hide();
        $("#cold-drinks").hide();
        $("#food").hide();
        $("#snacks").show();
    }
    $(".sort-btn").removeClass("active");
    $(this).addClass("active");
    console.log($btnID);
})

//Create a new order
$("#add-new-order").click(function(){
    showCurrentOrder();

    var addNewOrder = $.ajax({
        url: "controllers/new-order.php"
    });

    setTimeout(function(){
        $("#current-order-info").load("views/current-order-info-view.php");
    } , 1000);
})

//Get current order total
function orderTotal(){
    setTimeout(function(){
        $("#current-order-total").load("controllers/total.php");
    } , 1000);
}

//Add item to current order
$("#add-btn").click(function(){
    if(orderProcessing()==true){
        if(itemValid()==true){
            $itemID = $("#option-item-name").attr("data-item-id");
            $itemPrice = $("#option-item-price").attr("data-item-price");
            $opt_1 = $("#add-in-size").attr("data-option-name");
            $opt_2 = $("#add-in-cream").attr("data-option-name");
            $opt_3 = $("#add-in-milk").attr("data-option-name");
            $opt_4 = $("#add-in-tea-bag").attr("data-option-name");
            $opt_5 = $("#add-in-ice").attr("data-option-name");

            var addItem = $.ajax({
                type: 'POST',
                url: "controllers/add.php",
                data: { id: $itemID, price: $itemPrice, opt_1: $opt_1, opt_2: $opt_2, opt_3: $opt_3, opt_4: $opt_4, opt_5: $opt_5 },
                dataType: "text"
            });

            setTimeout(function(){
                $("#current-order-items").load("views/current-order-item-view.php");
            } , 1000);

            orderTotal();

            hideOptions();

            clearAllOptions();
        }else{
            alert("Please select a size");
        }
    }else{
        alert("Please add a new order");
    }
})

//Delete item from current order
$( document ).on('click', '.delete', function(){
    $orderItemID = $(this).attr("data-order-item-id");

    var deleteItem = $.ajax({
        type: 'POST',
        url: "controllers/delete-order-item.php",
        data: { id: $orderItemID} ,
        dataType: "text"
    });

    setTimeout(function(){
        $("#current-order-items").load("views/current-order-item-view.php");
    } , 1000);

    orderTotal();
})

//Creates customisation menu for current item selected
$(".item-btn").click(function(){
    clearAllOptions();
    showOptions();

    $itemID = $(this).attr("data-id");
    $itemName = $(this).attr("data-item-name");
    $itemPrice = $(this).attr("data-item-price");

    $(".item-btn").removeClass("active");
    $(this).addClass("active");

    $("#option-item-name").empty();
    $("#option-item-name").append($itemName);
    $("#option-item-price").empty();
    $("#option-item-price").append("£", $itemPrice);
    $("#option-item-name").attr("data-item-id", $itemID);
    $("#option-item-price").attr("data-item-price", $itemPrice);

    options["itemPrice"] = parseFloat($itemPrice);

    itemAllergens();

    sortOptions();
})

//Cancel order
$( document ).on('click', '#cancel-btn', function(){
    $orderID = $("#current-order-id").attr("data-order-id");

    var deleteOrder = $.ajax({
        type: 'POST',
        url: "controllers/cancel-order.php",
        data: { id: $orderID} ,
        dataType: "text"
    });

    newOrder();
})

//Process order
$( document ).on('click', '#pay-btn', function(){
    if(orderValid()==true){
        $orderID = $("#current-order-id").attr("data-order-id");

        var processOrder = $.ajax({
            type: 'POST',
            url: "controllers/process-order.php",
            data: { id: $orderID} ,
            dataType: "text"
        });

        loadPendingOrders();

        newOrder();
    }else{
        alert("This order is empty.");
    }


})

//Option prices
var options = {};

//Total price of options
function sumOptions(options){
    var sum = 0;
    for(var option in options){
        if(options.hasOwnProperty(option)){
            sum += parseFloat(options[option]);
        }
    }
    return sum;
}

function priceUpdate(){
    var totaloptions = sumOptions(options);
    $("#option-item-price").empty();
    $("#option-item-price").append("£", totaloptions.toFixed(2));
    $("#option-item-price").attr("data-item-price", totaloptions.toFixed(2));
}

//Add options
$(".size-btn").click(function(){
    $optionID = $(this).attr("id");
    $optionName = $(this).attr('data-option-name');
    $(".size-btn").removeClass("active");
    $(this).addClass("active");

    $optionPrice = parseFloat($(this).attr("data-price"));

    options["size"] = $optionPrice;

    $("#add-in-size").remove();
    $(".option-list").append("<div class='option-added' id='add-in-size' data-option-name='"+$optionName+"'>\
    <span class='option-added-name'>+ "+$optionName+"</span>\
    <span class='option-added-price'>£"+$optionPrice.toFixed(2)+"</span>\
    </div>");

    priceUpdate();
})

$(".option-add-in").change(function(){
    $optionID = $(this).attr("id");
    $optionName = $('option:selected', this).attr('data-option-name');
    $optionPrice = parseFloat($('option:selected', this).attr('data-price'));

    options[$optionID] = $optionPrice;

    if($('option:selected', this).val()!=0){
        $("#add-in-"+$optionID).remove();
        $(".option-list").append("<div class='option-added' id='add-in-"+$optionID+"' data-option-name='"+$optionName+"'>\
    <span class='option-added-name'>+ "+$optionName+"</span>\
    <span class='option-added-price'>£"+$optionPrice.toFixed(2)+"</span>\
    </div>");

        priceUpdate();
    }else{
        $("#add-in-"+$optionID).remove();
    }
})

//Clear options
function clearAllOptions(){
    $("#option-item-name").empty();
    $("#option-item-price").empty();
    $(".size-btn").removeClass("active");
    //$("#default-size").addClass("active");
    $(".option-add-in").val("0");
    $(".option-added").remove();
}

//Hide options tab
function hideOptions(){
    $(".item-btn").removeClass("active");
    $(".order-options").hide();
}

function showOptions(){
    $(".order-options").slideDown(300);
}

//Load pending orders
function loadPendingOrders(){
    setTimeout(function(){
        $("#pending-orders").load("views/pending-orders-view.php");
        //orderTime();
    } , 1000);
}

//Complete pending orders
$( document ).on('click', '.done-btn', function(){
    $orderID = $(this).attr("data-pending-order-id");

    var completeOrder = $.ajax({
        type: 'POST',
        url: "controllers/complete-order.php",
        data: { id: $orderID} ,
        dataType: "text"
    });

    loadPendingOrders();
})

//Sort options depending on type
function sortOptions(){
    $(".option").hide();

    $itemType = $(".item-btn.active").attr("data-type");

    if($itemType==="Coffee" || $itemType==="Latte" || $itemType==="Mocha" || $itemType==="Tea" || $itemType==="Iced" || $itemType==="Cappuccino" || $itemType==="Americano"){
        $("#option-size").show();
    }
    if($itemType==="Coffee" || $itemType==="Latte" || $itemType==="Mocha" || $itemType==="Cappuccino" || $itemType==="Americano"){
        $("#option-cream").show();
    }
    if($itemType==="Coffee" || $itemType==="Latte" || $itemType==="Mocha"){
        $("#option-whipped-cream").show();
    }
    if($itemType==="Coffee" || $itemType==="Latte" || $itemType==="Mocha" || $itemType==="Tea" || $itemType==="Cappuccino"){
        $("#option-milk").show();
    }
    if($itemType==="Tea"){
        $("#option-tea-bags").show();
    }
    if($itemType==="Iced"){
        $("#option-ice").show();
    }
}

//Update pending orders every second
window.setInterval(function(){
    loadPendingOrders();
}, 1000);

//Order process validation
function orderValid(){
    if($(".current-order-item").length){
        return true;
    }else{
        return false;
    }
}

//Item add validation
function itemValid(){
    $itemType = $(".item-btn.active").attr('data-type');
    if($itemType==="Coffee" || $itemType==="Latte" || $itemType==="Mocha" || $itemType==="Tea" || $itemType==="Iced" || $itemType==="Hot Chocolate" || $itemType==="Cappuccino" || $itemType==="Americano"){
        if($("#add-in-size").length){
            return true;
        }else{
            return false;
        }
    }return true;
}

//Order processing check
function orderProcessing(){
    if($("#current-order-info").is(':empty')){
        return false;
    }else{
        return true;
    }
}

function orderIntervalCheck(){
    $interval=$(".pending-order-time").attr("data-interval");
    $i = parseint($interval);

    if($i>120){
        return true;
    }
}

function itemAllergens(){
    $("#item-allergens").empty();

    $itemType = $(".item-btn.active").attr("data-type");

    if($itemType==="Coffee" || $itemType==="Latte" || $itemType==="Mocha" || $itemType==="Tea" || $itemType==="Iced" || $itemType==="Hot Chocolate" || $itemType==="Cappuccino" || $itemType==="Americano"){
        $("#item-allergens").append("<span>Contains: <b>Milk</b></spam>");
    }
    if($itemType==="Biscuits"){
        $("#item-allergens").append("<span>Contains: <b>Wheat</b></spam>")
    }
    if($itemType==="Crisps"){
        $("#item-allergens").append("<span>Contains: <b>Gluten</b>, <b>Dairy</b></spam>")
    }
    if($itemType==="Hot Sandwich"){
        $("#item-allergens").append("<span>Contains: <b>Wheat</b>, <b>Milk</b>, <b>Soya</b>, <b>Barley</b></spam>")
    }
    if($itemType==="Cold Sandwich"){
        $("#item-allergens").append("<span>Contains: <b>Wheat</b>, <b>Milk</b></spam>")
    }
    if($itemType==="Chocolate"){
        $("#item-allergens").append("<span>Contains: <b>Milk</b>, <b>Egg</b>, <b>Barley</b>, <b>Soya</b></spam>")
    }

    $("#item-allergens").delay(300).show(0);
}

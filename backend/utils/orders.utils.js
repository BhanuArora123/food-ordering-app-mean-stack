var orderModel = require("../models/order.model");

var outletModel = require("../models/outlets.model");

var ObjectId = require("mongoose").Types.ObjectId;

var orders = require("../models/order.model");

var updateTable = function (outletId,tableId,dataToUpdate) {
    try {
        return outletModel
        .updateOne({
            _id:ObjectId(outletId)
        },{
            "tables.$[table].isAssigned":dataToUpdate.isAssigned,
            "tables.$[table].assignedOrderId":dataToUpdate.assignedOrderId,
        },{
            arrayFilters:[
                {
                    "table.tableId":parseInt(tableId)
                }
            ]
        })
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}

var changeUserTable = function (tableToAssign,currentOrderData,outletId) {
    if(!tableToAssign){
        return;
    }
    var tableReplaceOrder;
    updateTable(outletId, tableToAssign, {
        isAssigned: true,
        assignedOrderId: currentOrderData._id
    })
    .then(function(){
        return orders.findOne({
            assignedTable: tableToAssign,
            orderType: "Dine In",
            status:{
                $ne:"Closed"
            },
            _id:{
                $ne:ObjectId(currentOrderData._id)
            }
        })
    })
    .then(function (replacedOrder) {
        // swap order in case of table conflict 
        if (!replacedOrder) {
            if (tableToAssign) {
                return updateTable(outletId, currentOrderData.assignedTable, {
                    isAssigned: false,
                    assignedOrderId: null
                })
            }
            return;
        }
        tableReplaceOrder = replacedOrder;
        return updateTable(outletId, currentOrderData.assignedTable, {
            isAssigned: true,
            assignedOrderId: replacedOrder._id
        })
    })
    .then(function () {
        if(tableReplaceOrder){
            return orders.updateOne({
                _id: ObjectId(tableReplaceOrder._id),
            }, {
                $set: {
                    assignedTable: currentOrderData.assignedTable
                }
            })
        }
    })
}

module.exports = {
    changeUserTable:changeUserTable,
    updateTable:updateTable
};

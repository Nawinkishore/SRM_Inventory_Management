import Purchase from "../models/purchase.model.js";

export const createPurchase = async (req,res)=>{
    const {userId, orderName, items} = req.body;
    try {
        
        if (!orderName) {
            return res.status(400).json({message: "Order name is required"});
        }
        const existingPurchase = await Purchase.findOne({orderName});
        if(existingPurchase){
            return  res.status(400).json({message: "Purchase with this order name already exists"});
        }
        const newPurchase = new Purchase({
            userId,
            orderName,
            items
        });
        const savedPurchase = await newPurchase.save();
        res.status(201).json(
            {message: "Purchase created successfully", purchase: savedPurchase}
        );
    } catch (error) {
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const getPurchaseList = async (req,res)=>{
    
    try {
        const {userId ,page = 1 ,limit = 1} = req.query;
        if(!userId){
            return res.status(400).json({message: "User ID is required"});
        }
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const totalPurchases = await Purchase.countDocuments({userId});
        const totalPages = Math.ceil(totalPurchases / limitNumber);

        const purchases = await Purchase.find({userId})
        .sort({createdAt: -1})
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
        res.status(200).json({purchases, pagination:{
            total : totalPurchases,
            currentPage : pageNumber,
            totalPages : totalPages,
            limit : limitNumber
        }});
    } catch (error) {
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}


export const getPurchaseById = async (req,res)=>{
    const {purchaseId} = req.params;
    try {
        const purchase = await Purchase.findById(purchaseId);
        if(!purchase){
            return res.status(404).json({message: "Purchase not found"});
        }
        res.status(200).json({purchase});
    } catch (error) {
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const updatePurchaseById = async (req,res)=>{
    const {purchaseId} = req.params;
    const {orderName, items} = req.body;
    try{
        const updatedPurchase = await Purchase.findByIdAndUpdate(
            purchaseId,
            { orderName, items },
            { new: true }
        );
        if(!updatedPurchase){
            return res.status(404).json({message: "Purchase not found"});
        }
        res.status(200).json({message: "Purchase updated successfully", purchase: updatedPurchase});
    } catch (error) {
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const deletePurchasebyId = async (req,res)=>{
    const {purchaseId} = req.params;
    try {
        const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
        if(!deletedPurchase){
            return res.status(404).json({message: "Purchase not found"});
        }
        res.status(200).json({message: "Purchase deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}
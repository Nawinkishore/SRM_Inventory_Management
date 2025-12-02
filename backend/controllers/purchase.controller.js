import Purchase from "../models/purchase.model.js";

export const createPurchase = async (req,res)=>{
    const {userId, orderName, items} = req.body;
    try {
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({message: "Invalid purchase data"});
        }
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
    const {userId} = req.params;
    try {
        const purchases = await Purchase.find({userId}).sort({createdAt: -1});
        res.status(200).json({purchases});
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
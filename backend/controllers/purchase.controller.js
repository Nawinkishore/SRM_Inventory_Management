import Purchase from "../models/purchase.model.js";

export const createPurchase = async (req,res)=>{
    const {userId, orderName, items} = req.body;
    try {
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
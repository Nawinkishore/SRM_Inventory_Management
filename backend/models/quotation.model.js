import mongoose from "mongoose";


const itemSchema = new mongoose.Schema({
    partName : { type: String, required: true},
    partNo : { type: String, required: true },
    quantity : { type: Number, required: true },
    MRP : { type: Number, required: true }
})

const quotationSchema = new mongoose.Schema(
    {
        quotationNumber: { type: String, required: true, unique: true },
        date : { type: Date, default: Date.now },
        customer :{
            name: { type: String, required: true },
            phone: { type: String, required: true },
        },
        items: { type: [itemSchema], required: true },
        totalAmount: { type: Number, required: true },
    },
    { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;

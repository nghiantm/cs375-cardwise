const Spending = require('../models/Spending');
const { count } = require('../models/User');

exports.createSpending = async (req, res, next) => {
    // POST /api/spending
    // Create a new spending entry
    try {
        const { amount, category, date, merchant, notes, cardUsed } = req.body;
        //const userId = req.userId; // Assume userId is set in req by auth middleware
        // shouldn't req userId be fetched or be present in all to link our things?

        // Validate required fields
        if (amount === undefined || !category) {
            return res.status(400).json({
                success: false,
                message: 'Amount and category are required'
            });
        }

        const userId = '691e5bb8367d68ed3a766bfd';

        const newSpending = await Spending.create({
            userId,
            amount,
            category,
            date,
            merchant,
            notes,
            cardUsed
        }); // what if optional fields are not present?

        //await newSpending.populate('userId', 'profile.firstName profile.lastName');

        return res.status(201).json({
            id: newSpending._id,
            success: true,
            message: 'Spending entry created successfully',
            data: newSpending
        });
    } catch (error) {
        next(error);
    }

};

exports.getAllSpendings = async (req, res, next) => {
    // GET /api/spending
    try {
        const userId = '691e5bb8367d68ed3a766bfd'; 
        const { category, startDate, endDate } = req.query; // Optional category filter
        const filter = { userId };
        if (category) filter.category = category;

        // Filter by date range
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                filter.date.$gte = new Date(startDate);  // Greater than or equal
            }
            if (endDate) {
                filter.date.$lte = new Date(endDate);  // Less than or equal
            }
        }        

        const spendings = await Spending.find(filter)
            .populate('userId', 'profile.firstName')
            .sort({ date: -1 });  // Newest first
        
        return res.status(200).json({
            success: true,
            count: spendings.length,
            data: spendings
        });
    } catch (error) {
        next(error);
    }
};

exports.getSpendingById = async (req, res, next) => {
    try {
    const { id } = req.params;
    const spending = await Spending.findById(id)
        .populate('userId', 'profile.firstName profile.lastName');

    if (!spending) {
        return res.status(404).json({
            success: false,
            message: 'Spending record not found'
        });
    }

    return res.status(200).json({
        success: true,
        data: spending
    });
    } catch (error) {
        next(error);
    }

}

exports.updateSpending = async (req, res, next) => {
    // PUT /api/spending/:id
    try {
    const { id } = req.params;
    const { amount, category, date, merchant, notes, cardUsed } = req.body;
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (category) updateData.category = category;
    if (date) updateData.date = date;
    if (merchant !== undefined) updateData.merchant = merchant;  // Allow clearing
    if (notes !== undefined) updateData.notes = notes;
    if (cardUsed !== undefined) updateData.cardUsed = cardUsed;    
    const updated = await Spending.findByIdAndUpdate(
        id,
        updateData,
        { new: true , runValidators: true}  // Return updated document
    ).populate('userId', 'profile.firstName profile.lastName');

    if (!updated) {
        return res.status(404).json({
            success: false,
            message: 'Spending record not found'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Spending record updated successfully',
        data: updated
    });
} catch (error) {
    next(error);
}

}   

exports.deleteSpending = async (req, res, next) => {
    // DELETE /api/spending/:id
    try {
    const { id } = req.params;
    const deleted = await Spending.findByIdAndDelete(id);

    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: 'Spending record not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Spending deleted successfully'
    });
} catch (error) {
    next(error);
}

}
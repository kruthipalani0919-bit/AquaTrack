import { z } from "zod";

const pondLeaseBaseSchema = z.object({
    tankId: z.string().min(1, "Tank is required"),

    totalLeaseAmount: z.number({
        required_error: "Total lease amount is required",
        invalid_type_error: "Total lease amount must be a number"
    }).positive("Total lease amount must be greater than 0"),

    leaseStartDate: z.string().min(1, "Lease start date is required"),

    leaseEndDate: z.string().min(1, "Lease end date is required"),

    remarks: z.string().optional().nullable()
});

export const createPondLeaseSchema = pondLeaseBaseSchema.refine((data) => {
    const start = new Date(data.leaseStartDate);
    const end = new Date(data.leaseEndDate);
    return end >= start;
}, {
    message: "Lease end date cannot be before lease start date",
    path: ["leaseEndDate"]
});

export const updatePondLeaseSchema = pondLeaseBaseSchema.partial().refine((data) => {
    if (data.leaseStartDate && data.leaseEndDate) {
        const start = new Date(data.leaseStartDate);
        const end = new Date(data.leaseEndDate);
        return end >= start;
    }
    return true;
}, {
    message: "Lease end date cannot be before lease start date",
    path: ["leaseEndDate"]
});

import ApiResponse from "../utils/ApiResponse.js";

export const healthCheck = (req, res) => {

    return res.status(200).json(

        new ApiResponse(
            200,
            "AquaTrack API is running",
            {
                version: "1.0.0"
            }
        )

    );

};
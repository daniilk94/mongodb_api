db.user.aggregate([
	{
		$lookup: {
		    from: "data",
            localField: "username",
            foreignField: "userid",
            as: "user_records"
        }
    },
    {
        $group: {
            _id: "$username",
            recordCount: {
                $sum:{
                    $size: {
                        $ifNull: ["$user_records", []]
                    }
                }
            }
        }
    },
    {
        $project: {
            id: 0,
            username: "$_id",
            recordsCount: 1
        }
    }
])
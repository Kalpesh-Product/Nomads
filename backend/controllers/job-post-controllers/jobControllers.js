import JobPost from "../../models/job-post/JobPost.js";
import JobCategory from "../../models/job-post/JobPostCategory.js";

export const addNewJobPost = async (req, res, next) => {
  try {
    const { categoryId, about, responsibilities, qualifications } = req.body;

    const category = await JobCategory.findById(categoryId).exec();
    if (!category) {
      return res.status(404).json({ message: "Job category not found" });
    }

    const normalizeArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) {
        return input.map((item) => String(item).trim()).filter(Boolean);
      }
      return String(input)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const newJob = await JobPost.create({
      category: categoryId,
      about: String(about || "").trim(),
      responsibilities: normalizeArray(responsibilities),
      qualifications: normalizeArray(qualifications),
      isActive: true,
    });

    return res.status(201).json({
      message: "Job post created successfully",
      jobPost: newJob,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobPosts = async (req, res, next) => {
  try {
    const { withEmpty = "false", limit = 0, page = 1 } = req.query;
    const perPage = Math.max(parseInt(limit, 10) || 0, 0);
    const skip = perPage
      ? (Math.max(parseInt(page, 10) || 1, 1) - 1) * perPage
      : 0;

    const pipeline = [
      // 1) keep only active categories first
      { $match: { isActive: true } },

      // 2) lookup active posts per category
      {
        $lookup: {
          from: "jobposts", // <-- use your real collection name
          let: { catId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$catId"] }, // adjust to your field name (e.g., categoryId)
                isActive: true, // only active posts
              },
            },
            { $sort: { createdAt: -1 } }, // optional: newest first
            {
              $project: {
                title: 1,
                location: 1,
                type: 1,
                createdAt: 1,
                // add other fields you want exposed
              },
            },
          ],
          as: "jobPosts",
        },
      },

      // 3) (optional) keep only categories that have posts
      ...(withEmpty === "false"
        ? [{ $match: { "jobPosts.0": { $exists: true } } }]
        : []),

      // 4) (optional) paginate categories
      ...(perPage ? [{ $skip: skip }, { $limit: perPage }] : []),

      // 5) final shape
      {
        $project: {
          _id: 1,
          name: 1, // or categoryName, whatever your field is
          isActive: 1,
          jobPosts: 1,
        },
      },
    ];

    const allActiveJobPosts = await JobCategory.aggregate(pipeline);
    res.status(200).json(allActiveJobPosts);
  } catch (error) {
    next(error);
  }
};

export const updateJobPost = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Normalize array fields
    const normalizeArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) {
        return input.map((item) => String(item).trim()).filter(Boolean);
      }
      return String(input)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const updateData = { ...req.body };

    if ("responsibilities" in updateData) {
      updateData.responsibilities = normalizeArray(updateData.responsibilities);
    }
    if ("qualifications" in updateData) {
      updateData.qualifications = normalizeArray(updateData.qualifications);
    }

    const updatedJob = await JobPost.findOneAndUpdate(
      { _id: jobId },
      { $set: updateData },
      { new: true }
    ).exec();

    if (!updatedJob) {
      return res.status(404).json({ message: "Job post not found" });
    }

    return res.status(200).json({
      message: "Job post updated successfully",
      jobPost: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateJobPost = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    await JobPost.findByIdAndUpdate(jobId, { isActive: false }).exec();
    return res
      .status(200)
      .json({ message: "Job posting deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

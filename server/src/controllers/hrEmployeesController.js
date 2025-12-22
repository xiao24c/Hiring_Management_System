import User from "../models/User.js";
import OnboardingApplication from "../models/OnboardingApplication.js";
import VisaStatus from "../models/VisaStatus.js";

/**
 * GET /api/hr/employees
 * HR 查看员工 summary（用于列表）
 */
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("email username")
      .lean();

    const userIds = employees.map((e) => e._id);

    const onboardings = await OnboardingApplication.find({
      userId: { $in: userIds }
    })
      .select("userId name legalInfo contactInfo visaInfo")
      .lean();

    // 快速 lookup
    const onboardingMap = new Map(
      onboardings.map((o) => [o.userId.toString(), o])
    );

    const result = employees.map((user) => {
      const onboarding = onboardingMap.get(user._id.toString());

      return {
        userId: user._id,
        email: user.email,

        name: onboarding?.name || {},
        ssn: onboarding?.legalInfo?.ssn || "",
        phone: onboarding?.contactInfo?.cellPhone || "",
        workAuthorization:
          onboarding?.visaInfo?.isCitizenOrPR === true
            ? onboarding?.visaInfo?.status
            : onboarding?.visaInfo?.workAuthorization || "",
      };
    });

    // 按 last name 排序
    result.sort((a, b) =>
      (a.name.lastName || "").localeCompare(b.name.lastName || "")
    );

    res.json({ employees: result });

  } catch (err) {
    console.error("getAllEmployees error:", err);
    res.status(500).json({ msg: "Server error loading employees" });
  }
};


/**
 * GET /api/hr/employees/:userId
 * HR 查看单个员工完整档案
 * 包含：User + Onboarding + Visa（如果是 F1）
 */
export const getEmployeeById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const onboarding = await OnboardingApplication.findOne({ userId }).lean();

    const visa = await VisaStatus.findOne({ userId }).lean();

    return res.json({
      user,
      onboarding,
      visa
    });

  } catch (err) {
    console.error("getEmployeeById error:", err);
    return res.status(500).json({ msg: "Server error loading employee details" });
  }
};
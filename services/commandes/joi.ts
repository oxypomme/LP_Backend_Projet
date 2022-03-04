import JoiDate from "@joi/date";
import Joi from "joi";

// Add Joi plugins here
const joi = Joi.extend(JoiDate);

export default joi as Joi.Root;

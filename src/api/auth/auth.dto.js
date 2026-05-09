import Joi from "joi";

const firstNameValidation = Joi.string().trim().min(2).messages({
  "string.base": "First name should be a type of text.",
  "string.empty": "First name should not be empty.",
  "string.min": "First name must be at least 2 characters long.",
  "any.required": "First name is required.",
});

const lastNameValidation = Joi.string().trim().min(2).messages({
  "string.base": "Last name should be a type of text.",
  "string.empty": "Last name should not be empty.",
  "string.min": "Last name must be at least 2 characters long.",
  "any.required": "Last name is required.",
});

const emailValidation = Joi.string().email().trim().lowercase().messages({
  "string.base": "Email should be a type of text.",
  "string.email": "Please provide a valid email address.",
  "string.empty": "Email should not be empty.",
  "any.required": "Email is required.",
});

const passwordValidation = Joi.string().trim().min(6).messages({
  "string.base": "Password should be a type of text.",
  "string.empty": "Password should not be empty.",
  "string.min": "Password must be at least 6 characters long.",
  "any.required": "Password is required.",
});

const isRememberedValidation = Joi.boolean().messages({
  "boolean.base": "Is remembered should be a type of boolean.",
  "any.required": "A boolean value of isRemembered field is required.",
});

const signupDto = Joi.object({
  firstName: firstNameValidation.required(),
  lastName: lastNameValidation.required(),
  email: emailValidation.required(),
  password: passwordValidation.required(),
});

const signinDto = Joi.object({
  email: emailValidation.required(),
  password: passwordValidation.required(),
  isRemembered: isRememberedValidation.optional(),
});

const forgotPasswordDto = Joi.object({
  email: emailValidation.required(),
});

export { signupDto, signinDto, forgotPasswordDto };

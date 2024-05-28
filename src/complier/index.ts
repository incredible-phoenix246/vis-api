import handlebars from "handlebars";
import { welcome } from "../templates/welcome";

function compilerOtp(otp_code: number) {
  const template = handlebars.compile(welcome);
  const htmlBody = template({
    otp: otp_code,
  });
  return htmlBody;
}

export { compilerOtp };

import handlebars from "handlebars";
import { welcome } from "../templates/welcome";
import { Order } from "../templates/order";

function compilerOtp(otp_code: number) {
  const template = handlebars.compile(welcome);
  const htmlBody = template({
    otp: otp_code,
  });
  return htmlBody;
}

function compilerOrder(tracking_id: string) {
  const template = handlebars.compile(Order);
  const htmlBody = template({
    tracking_link: `${process.env.FrontendTrackingUrl}?id=${tracking_id}`,
    tracking_id: tracking_id,
    complain_link: `${process.env.FrontendComplainUrl}`,
  });
  return htmlBody;
}

export { compilerOtp, compilerOrder };

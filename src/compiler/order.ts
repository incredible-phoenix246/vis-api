import handlebars from "handlebars";
import { OrderMail } from "../templates/order";

function compileOrder(name: string, url: string) {
  const template = handlebars.compile(OrderMail);
  const htmlBody = template({
    name: name,
    url: url,
  });
  return htmlBody;
}

export { compileOrder };

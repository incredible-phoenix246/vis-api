import handlebars from "handlebars";
import { SubMail } from "../templates/sub";

function compileSub(name: string) {
  const template = handlebars.compile(SubMail);
  const htmlBody = template({
    name: name,
  });
  return htmlBody;
}

export { compileSub };

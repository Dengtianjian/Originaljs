export namespace Methods {
  export const OnAttributeName: RegExp = /^on[a-z]+$/;
  export const MethodNameAttibuteValue: RegExp = /^\w+(\(\))?/;
  export const MatchMethodName: RegExp = /\w+(\(.+\))?;?/;
  export const MethodName: RegExp = /\w+(?=\(.+\))?/;
  export const MethodType: RegExp = /(?<=on)\w+/;
  export const MethodParams: RegExp = /(?<=\().+(?=\))/;
}
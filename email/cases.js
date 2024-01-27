const {signature} = require('./common')

const caseTemplate = ({fullName,caseData}) =>{
    return `
    <p>Dear <b>${fullName}</b>,</p>

          <p>We trust this email finds you well. As part of the ongoing resolution process for Case No: <b>${caseData.caseNo}</b>, we would like to inform you that the reply and response documents have been prepared and are ready for download and submission to the Goods and Services Tax Network (GSTN).</p>
          <p>Documents for Submission:</p>
          <ul>
           <li> <b>Reply Document:</b> Download from navigating to cases section under your profile and navigating to case no <b>${caseData.caseNo}</b>.</li>
          </ul>
          <p>Please download the attached documents, carefully review the information, and ensure its accuracy. Following that, kindly proceed with the submission to GSTN using the prescribed portal or method outlined in the notice.</p>
          
          <p><b>Important Note:</b> Ensure that the submission is made within the stipulated timeframe mentioned in the notice to avoid any potential implications.</p>
          
          <p>If you encounter any issues during the submission process or if you require any clarification on the documents provided, please do not hesitate to contact our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b> .</p>
          
          <p>Thank you for your cooperation in this matter. We appreciate your prompt attention to the case, and we remain committed to assisting you throughout the resolution process.</p>
    ${signature}
    `;
}

module.exports = caseTemplate;
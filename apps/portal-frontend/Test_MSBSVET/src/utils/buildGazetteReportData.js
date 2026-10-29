export const aggregateCandidatesWithSubjects = (data) => {
  const candidateMap = new Map();

  data.forEach(row => {
    const appId = row.ApplicationID;

    if (!candidateMap.has(appId)) {
      candidateMap.set(appId, {
        ApplicationID: row.ApplicationID,
        ApplicationIDDisplay: row.ApplicationIDDisplay,
        CandidateName: row.CandidateName,
        ResultStatus: row.ResultStatus,
        Grade: row.Grade || '-',
        Percentage: (row.ResultStatus === 'Fail' || row.ResultStatus === 'ABSENT')
          ? 'NA'
          : (row.Percentage ? `${row.Percentage}%` : '-'),
        TotalMarksObt: row.TotalMarksObt,
        TotalMarksMax: row.TotalMarksMax,
        GraceMarks: row.GraceMarks ? `${row.GraceMarks}` : '0',
        subjects: {},
      });
    }

    if (row.SubjectName) {
      const compositeKey = `${row.SubjectCode}_${row.SubjectType || 'THEORY'}`;
      const candidate = candidateMap.get(appId);

      candidate.subjects[compositeKey] = {
        SubjectName: row.SubjectName,
        SubjectCode: row.SubjectCode,
        SubjectType: row.SubjectType || 'THEORY',
        obt: row.Result === 'Absent'
          ? 'AB'
          : `${row.obt}${row.Result === 'Fail' ? '*' : row.SubjectGraceMarks !== '' ? '@' : ''}` || '-',
        max: row.max,
        min: row.min,
      };
    }
  });

  return Array.from(candidateMap.values());
};

export const buildGazetteReportData = ({
  rawApiData,
  examinationId,
  examinationName,
  instituteName,
  instituteCode = '',
}) => {
  const examinationFiltered = rawApiData.filter(
    row => String(row.ExaminationID || row.Examination_Id) === String(examinationId)
  );

  if (!examinationFiltered.length) {
    throw new Error('No data found for the selected examination');
  }

  const courseMap = new Map();
  examinationFiltered.forEach(row => {
    const courseKey = `${row.InstituteCode}_${row.CourseID}`;

    if (!courseMap.has(courseKey)) {
      courseMap.set(courseKey, {
        courseId: row.CourseID,
        courseName: row.CourseName || row.CourseNameCode || '-',
        courseCode: row.CourseCode || '',
        instituteCode: row.InstituteCode,                          
        instituteName: row.InstituteNameCode || row.InstituteName || '', 
        district: row.District,
        candidates: [],
        subjectsMap: new Map(),
      });
    }
    courseMap.get(courseKey).candidates.push(row);

    if (row.SubjectName) {
      const courseData = courseMap.get(courseKey);
      const compositeKey = `${row.SubjectCode}_${row.SubjectType || 'THEORY'}`;
      if (!courseData.subjectsMap.has(compositeKey)) {
        courseData.subjectsMap.set(compositeKey, {
          SubjectName: row.SubjectName,
          SubjectCode: row.SubjectCode,
          SubjectType: row.SubjectType || 'THEORY',
          max: row.max,
          min: row.min,
        });
      }
    }
  });

  const coursesData = [];
  for (const [, course] of courseMap) {
    const aggregatedCandidates = aggregateCandidatesWithSubjects(course.candidates);

    const allSubjects = Array.from(course.subjectsMap.values()).sort((a, b) => {
      if (a.SubjectCode !== b.SubjectCode) return a.SubjectCode.localeCompare(b.SubjectCode);
      return a.SubjectType.localeCompare(b.SubjectType);
    });

    const theorySubjects = allSubjects.filter(s => s.SubjectType?.toUpperCase() === 'THEORY');
    const practicalSubjects = allSubjects.filter(s => s.SubjectType?.toUpperCase() === 'PRACTICAL');

    const pass = aggregatedCandidates.filter(c => c.ResultStatus === 'Pass').length;
    const fail = aggregatedCandidates.filter(c => c.ResultStatus === 'Fail' || c.ResultStatus === 'ABSENT').length;
    const hold = aggregatedCandidates.filter(c => c.ResultStatus === 'Result Hold').length;

    aggregatedCandidates.sort((a, b) => {
      const numA = parseInt(a.ApplicationIDDisplay?.split('/')[0] || '0');
      const numB = parseInt(b.ApplicationIDDisplay?.split('/')[0] || '0');
      return numA - numB;
    });

    coursesData.push({
      courseId: course.courseId,
      courseName: course.courseName,
      courseCode: course.courseCode,
      instituteCode: course.instituteCode,  
      instituteName: course.instituteName,
      stats: { total: aggregatedCandidates.length, pass, fail, hold },
      candidates: aggregatedCandidates,
      theorySubjects,
      practicalSubjects,
      district: course.district,
    });
  }

  // coursesData.sort((a, b) => {
  //   if (a.instituteName !== b.instituteName) return a.instituteName.localeCompare(b.instituteName);
  //   return a.courseName.localeCompare(b.courseName);
  // });

  const firstRow = examinationFiltered[0];
  

  return {
    courses: coursesData,
    instituteDetails: {
      name: instituteName && instituteName !== 'All Institutes'
        ? instituteName
        : 'All Institutes',
      code: instituteCode,
    },
    examinationDetails: {
      name: firstRow?.ExaminationName || '-',
      duration: firstRow?.Duration || '-',
    },
    signature: {
      name: firstRow?.StatementMarksDesignation || '',
      designation: firstRow?.StatementMarksName || 'SECRETARY',
      signUrl: firstRow?.StatementMarksSign || '',
    },
    district: firstRow?.District || '',
    resultDate: firstRow?.ResultDate || '',
  };
};
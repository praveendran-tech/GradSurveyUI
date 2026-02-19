import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Student, MasterData } from '../types';
import { StudentCard } from './StudentCard';

interface StudentListProps {
  students: Student[];
  onSelectSource: (studentId: string, source: 'qualtrics' | 'linkedin' | 'clearinghouse') => void;
  onAddManual: (studentId: string, data: Partial<MasterData>) => void;
  onEditMaster: (studentId: string, data: Partial<MasterData>) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectSource,
  onAddManual,
  onEditMaster,
}) => {
  if (students.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          No students found matching the filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {students.map((student) => (
        <StudentCard
          key={student.uid}
          student={student}
          onSelectSource={onSelectSource}
          onAddManual={onAddManual}
          onEditMaster={onEditMaster}
        />
      ))}
    </Box>
  );
};

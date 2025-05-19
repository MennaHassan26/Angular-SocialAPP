import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../Service/user/user.service';
import Swal from 'sweetalert2';
import { PostsService } from '../../Service/posts/posts.service';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: any;

  constructor(
    private userService: UserService,
    private router: Router,
    private postService: PostsService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

    this.profileForm = new FormGroup({
      username: new FormControl(''),
      profileImage: new FormControl(''),
      email: new FormControl(''),
    });

    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username || 'UnKnown User',
        profileImage: this.user.profileImage || 'assets/image.png',
        email: this.user.email || 'UnKnown Email',
      });
    }
  }

  onUpdate(): void {
    const updatedData = this.profileForm.value;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const updatedUser = {
      ...currentUser,
      username: updatedData.username,
      email: updatedData.email,
      profileImage: updatedData.profileImage,
    };

    this.userService.updateProfile(updatedUser).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Profile Data Updated!',
        text: 'Your profile has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      localStorage.setItem('user', JSON.stringify(updatedUser));
    });
  }

  onDelete(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete your account and all your posts!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete everything!',
    }).then((result) => {
      if (result.isConfirmed) {
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id : null;
        if (userId) {
          this.postService.deleteUserPosts(userId);
          this.userService.deleteAccount().subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Your account and posts have been deleted.',
              timer: 2000,
              showConfirmButton: false,
            });
            localStorage.removeItem('user');
            this.router.navigate(['/register']);
          });
        } else {
          console.error('User ID not found in localStorage');
        }
      }
    });
  }
  getUserName() {
    const user = this.userService.getCurrentUser();
    this.profileForm.value.username =
      user && user.username ? user.username : 'UnKnown User';
  }

  getUserEmail() {
    const user = this.userService.getCurrentUser();
    this.profileForm.value.email =
      user && user.email ? user.email : 'UnKnown User';
  }

  getUserProfileImage() {
    const user = this.userService.getCurrentUser();
    this.profileForm.value.profileImage =
      user && user.profileImage ? user.profileImage : 'assets/image.png';
    return this.profileForm.value.profileImage;
  }
}
